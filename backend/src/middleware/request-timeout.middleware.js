const logger = require("../utils/logger");

const REQUEST_TIMEOUT_MS = 10 * 1000; // 10 seconds

const requestTimeoutMiddleware = (req, res, next) => {
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      logger.warn(
        {
          action: "REQUEST_TIMEOUT",
          path: req.originalUrl,
          method: req.method,
          timeoutMs: REQUEST_TIMEOUT_MS,
          requestId: req.requestId || null,
          userId: req.user?.userId || null,
        },
        "Request timeout exceeded"
      );

      res.status(408).json({
        message: "Request timeout",
        code: "REQUEST_TIMEOUT",
        statusCode: 408,
      });
    }
  }, REQUEST_TIMEOUT_MS);

  // Clear timeout when request finishes normally
  res.on("finish", () => {
    clearTimeout(timeoutId);
  });

  res.on("close", () => {
    clearTimeout(timeoutId);
  });

  next();
};

module.exports = requestTimeoutMiddleware;
