const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");
const { buildErrorBody } = require("./error.middleware");

const writeRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 50, // 50 write operations per minute per IP
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator(req) {
    // Rate limit by IP address
    return req.ip || req.connection.remoteAddress;
  },
  handler(req, res) {
    logger.warn(
      {
        action: "WRITE_RATE_LIMIT_EXCEEDED",
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        requestId: req.requestId || null,
        userId: req.user?.userId || null,
      },
      "Write operation rate limit exceeded"
    );

    res.status(429).json(
      buildErrorBody({
        code: "WRITE_RATE_LIMIT_EXCEEDED",
        message: "Too many write operations, please try again later",
      })
    );
  },
});

module.exports = writeRateLimiter;
