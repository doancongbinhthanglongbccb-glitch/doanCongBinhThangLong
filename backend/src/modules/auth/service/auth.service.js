const bcrypt = require("bcrypt");
const User = require("../../../models/User");
const { hashToken } = require("../../../utils/token");
const logger = require("../../../utils/logger");
const { BadRequestError, ForbiddenError, UnauthorizedError } = require("../../../utils/errors");
const {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiryDate,
  verifyRefreshToken,
} = require("../domain/token");
const refreshTokenRepository = require("../repository/refresh-token.repository");

const login = async (payload, context = {}) => {
  const username = (payload?.username || payload?.email || "").trim();
  const password = payload?.password || "";

  if (!username || !password) {
    throw new BadRequestError("Username and password are required");
  }

  logger.info(
    {
      action: "LOGIN_ATTEMPT",
      username,
      ip: context.ip || null,
      requestId: context.requestId || null,
    },
    "Login attempt"
  );

  const user = await User.findOne({ username });
  if (!user) {
    logger.warn(
      {
        action: "LOGIN_FAILED",
        reason: "user_not_found",
        username,
        ip: context.ip || null,
        requestId: context.requestId || null,
      },
      "Login failed"
    );
    throw new UnauthorizedError("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    logger.warn(
      {
        action: "LOGIN_FAILED",
        reason: "invalid_password",
        userId: String(user._id),
        username: user.username,
        ip: context.ip || null,
        requestId: context.requestId || null,
      },
      "Login failed"
    );
    throw new UnauthorizedError("Invalid credentials");
  }

  if (!user.role || !["admin", "editor"].includes(user.role)) {
    throw new ForbiddenError("Only admin and editor accounts can sign in");
  }

  const tokenPayload = {
    userId: String(user._id),
    role: user.role,
  };

  const accessToken = createAccessToken(tokenPayload);
  const refreshToken = createRefreshToken(tokenPayload);
  const expiresAt = getRefreshTokenExpiryDate(refreshToken);
  await refreshTokenRepository.create({ userId: user._id, refreshToken, expiresAt });

  logger.info(
    {
      action: "LOGIN_SUCCESS",
      userId: String(user._id),
      ip: context.ip || null,
      requestId: context.requestId || null,
    },
    "Login success"
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: String(user._id),
      username: user.username,
      role: user.role,
    },
  };
};

const refresh = async (refreshToken, context = {}) => {
  if (!refreshToken) {
    throw new BadRequestError("Refresh token is required");
  }

  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.userId).select("role username");
  if (!user || !["admin", "editor"].includes(user.role)) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const hashedToken = hashToken(refreshToken);
  const existingToken = await refreshTokenRepository.findOne(hashedToken);

  if (!existingToken) {
    await refreshTokenRepository.revokeAllForUser(decoded.userId);

    logger.warn(
      {
        action: "TOKEN_REUSE_DETECTED",
        userId: String(decoded.userId),
        ip: context.ip || null,
        requestId: context.requestId || null,
      },
      "Refresh token reuse detected"
    );

    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  await refreshTokenRepository.deleteOne(hashedToken);

  const nextTokenPayload = {
    userId: String(decoded.userId),
    role: user.role,
  };

  const accessToken = createAccessToken(nextTokenPayload);
  const nextRefreshToken = createRefreshToken(nextTokenPayload);
  const expiresAt = getRefreshTokenExpiryDate(nextRefreshToken);
  await refreshTokenRepository.create({ userId: decoded.userId, refreshToken: nextRefreshToken, expiresAt });

  logger.info(
    {
      action: "TOKEN_REFRESH",
      userId: String(decoded.userId),
      ip: context.ip || null,
      requestId: context.requestId || null,
    },
    "Token refreshed"
  );

  return {
    accessToken,
    refreshToken: nextRefreshToken,
    user: {
      id: String(user._id),
      username: user.username,
      role: user.role,
    },
  };
};

const logout = async (refreshToken, context = {}) => {
  if (!refreshToken) {
    return { message: "Logged out successfully" };
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return { message: "Logged out successfully" };
  }

  const hashedToken = hashToken(refreshToken);
  await refreshTokenRepository.deleteOne(hashedToken);

  logger.info(
    {
      action: "LOGOUT",
      userId: String(decoded.userId),
      ip: context.ip || null,
      requestId: context.requestId || null,
    },
    "Logout success"
  );

  return { message: "Logged out successfully" };
};

module.exports = {
  login,
  refresh,
  logout,
};
