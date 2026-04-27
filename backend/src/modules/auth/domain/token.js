const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../../../utils/errors");

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

const verifyRefreshToken = (refreshToken) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT refresh secret is not configured");
  }

  try {
    return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiryDate,
  verifyRefreshToken,
};
