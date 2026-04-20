const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const logger = require("../utils/logger");
const { hashToken } = require("../utils/token");
const { BadRequestError, ForbiddenError, UnauthorizedError } = require("../utils/errors");

const createAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || "15m",
  });
};

const createRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT refresh secret is not configured");
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
  });
};

const getRefreshTokenExpiryDate = (refreshToken) => {
  const decoded = jwt.decode(refreshToken);
  if (!decoded || !decoded.exp) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  return new Date(decoded.exp * 1000);
};

const persistRefreshToken = async ({ userId, refreshToken }) => {
  const hashedToken = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiryDate(refreshToken);

  await RefreshToken.create({
    userId,
    token: hashedToken,
    expiresAt,
  });

  return hashedToken;
};

const revokeAllRefreshTokensForUser = async (userId) => {
  await RefreshToken.deleteMany({ userId });
};

const deleteRefreshToken = async (refreshToken) => {
  await RefreshToken.deleteOne({ token: hashToken(refreshToken) });
};

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
  await persistRefreshToken({ userId: user._id, refreshToken });

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

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT refresh secret is not configured");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const user = await User.findById(decoded.userId).select("role username");
  if (!user || !["admin", "editor"].includes(user.role)) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const hashedToken = hashToken(refreshToken);
  const existingToken = await RefreshToken.findOne({ token: hashedToken });

  if (!existingToken) {
    await revokeAllRefreshTokensForUser(decoded.userId);

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

  await deleteRefreshToken(refreshToken);

  const nextTokenPayload = {
    userId: String(decoded.userId),
    role: user.role,
  };

  const accessToken = createAccessToken({
    ...nextTokenPayload,
  });
  const nextRefreshToken = createRefreshToken(nextTokenPayload);
  await persistRefreshToken({ userId: decoded.userId, refreshToken: nextRefreshToken });

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
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    return { message: "Logged out successfully" };
  }

  await deleteRefreshToken(refreshToken);

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
