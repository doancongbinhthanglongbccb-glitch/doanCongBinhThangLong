const logger = require("../utils/logger");
const { buildErrorBody } = require("./error.middleware");

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

      res.status(408).json(
        buildErrorBody({
          code: "REQUEST_TIMEOUT",
          message: "Request timeout",
        })
      );
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
