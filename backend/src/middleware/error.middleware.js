const { AppError } = require("../utils/errors");
const logger = require("../utils/logger");

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isKnownError = err instanceof AppError;
  const statusCode = isKnownError ? err.statusCode : 500;
  const message = isKnownError ? err.message : "Internal server error";

  logger.error(
    {
      action: "REQUEST_ERROR",
      endpoint: req.originalUrl,
      method: req.method,
      userId: req.user?.userId || null,
      requestId: req.requestId || null,
      statusCode,
      errorName: err.name,
      errorMessage: err.message,
    },
    "Request failed"
  );

  return res.status(statusCode).json({
    message,
    statusCode,
  });
};

module.exports = errorMiddleware;
