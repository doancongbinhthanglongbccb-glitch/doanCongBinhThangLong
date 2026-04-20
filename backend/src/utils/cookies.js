const REFRESH_COOKIE_NAME = "refreshToken";
const { env } = require("../config/env");

const toBoolean = (value, defaultValue) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const normalized = String(value).toLowerCase().trim();
  if (["true", "1", "yes"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }

  return defaultValue;
};

const parseMaxAgeMs = (value) => {
  const normalized = String(value || "7d").trim();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized) * 1000;
  }

  const match = normalized.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitToMs = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitToMs[unit];
};

const buildRefreshCookieOptions = () => {
  const cookieDomain = (env.COOKIE_DOMAIN || "").trim();

  const options = {
    httpOnly: true,
    secure: toBoolean(env.COOKIE_SECURE, false),
    sameSite: env.COOKIE_SAME_SITE,
    path: "/api/auth",
    maxAge: parseMaxAgeMs(env.REFRESH_TOKEN_EXPIRE || "7d"),
  };

  if (cookieDomain) {
    options.domain = cookieDomain;
  }

  return options;
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, buildRefreshCookieOptions());
};

const clearRefreshTokenCookie = (res) => {
  const options = buildRefreshCookieOptions();
  delete options.maxAge;
  res.clearCookie(REFRESH_COOKIE_NAME, options);
};

module.exports = {
  REFRESH_COOKIE_NAME,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
};
