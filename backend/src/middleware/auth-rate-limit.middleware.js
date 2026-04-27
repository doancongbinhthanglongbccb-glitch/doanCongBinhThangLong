const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");
const { buildErrorBody } = require("./error.middleware");

const authLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler(req, res) {
    logger.warn(
      {
        action: "AUTH_RATE_LIMIT_EXCEEDED",
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        requestId: req.id || req.requestId || null,
      },
      "Auth login rate limit exceeded"
    );

    res.status(429).json(
      buildErrorBody({
        code: "AUTH_RATE_LIMIT_EXCEEDED",
        message: "Too many login attempts, please try again later",
      })
    );
  },
});

module.exports = {
  authLoginRateLimiter,
};
