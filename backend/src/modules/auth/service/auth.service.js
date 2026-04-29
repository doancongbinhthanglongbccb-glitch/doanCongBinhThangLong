const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../../../models/User");
const { hashToken } = require("../../../utils/token");
const logger = require("../../../utils/logger");
const { BadRequestError, ForbiddenError, UnauthorizedError } = require("../../../utils/errors");
const { env } = require("../../../config/env");
const { OAuth2Client } = require("google-auth-library");
const {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiryDate,
  verifyRefreshToken,
} = require("../domain/token");
const refreshTokenRepository = require("../repository/refresh-token.repository");

const getGoogleClient = (() => {
  let client = null;
  return () => {
    const clientId = (env.GOOGLE_CLIENT_ID || "").trim();
    if (!clientId) return null;
    if (!client) client = new OAuth2Client(clientId);
    return client;
  };
})();

const parseAllowList = (value) =>
  String(value || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

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

const googleLogin = async (payload, context = {}) => {
  const credential = (payload?.credential || "").trim();
  if (!credential) {
    throw new BadRequestError("Google credential is required");
  }

  const googleClient = getGoogleClient();
  if (!googleClient) {
    throw new BadRequestError("Google login is not configured");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: (env.GOOGLE_CLIENT_ID || "").trim(),
  });

  const tokenPayload = ticket.getPayload();
  const email = (tokenPayload?.email || "").toLowerCase().trim();
  const emailVerified = Boolean(tokenPayload?.email_verified);

  if (!email || !emailVerified) {
    throw new UnauthorizedError("Google account email is not verified");
  }

  // Restrict signup surface in production.
  const allowedEmails = parseAllowList(env.GOOGLE_ALLOWED_EMAILS);
  const allowedDomain = (env.GOOGLE_ALLOWED_DOMAIN || "").trim().toLowerCase();

  if (allowedEmails.length > 0) {
    if (!allowedEmails.includes(email)) {
      throw new ForbiddenError("Google account is not allowed");
    }
  } else if (allowedDomain) {
    if (!email.endsWith(`@${allowedDomain}`)) {
      throw new ForbiddenError("Google account domain is not allowed");
    }
  } else if (env.NODE_ENV === "production") {
    throw new ForbiddenError("Google login requires allowlist configuration");
  }

  // We map Google users to local `User` by username=email.
  let user = await User.findOne({ username: email });

  if (!user) {
    // Create a local user with a random password (password login is not the goal here).
    const randomPassword = crypto.randomBytes(32).toString("hex");
    user = await User.create({
      username: email,
      password: randomPassword,
      role: "editor",
    });
  }

  if (!user.role || !["admin", "editor"].includes(user.role)) {
    throw new ForbiddenError("Only admin and editor accounts can sign in");
  }

  logger.info(
    {
      action: "GOOGLE_LOGIN_SUCCESS",
      userId: String(user._id),
      ip: context.ip || null,
      requestId: context.requestId || null,
    },
    "Google login success"
  );

  const authPayload = { userId: String(user._id), role: user.role };
  const accessToken = createAccessToken(authPayload);
  const refreshToken = createRefreshToken(authPayload);
  const expiresAt = getRefreshTokenExpiryDate(refreshToken);
  await refreshTokenRepository.create({ userId: user._id, refreshToken, expiresAt });

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
  googleLogin,
  refresh,
  logout,
};
