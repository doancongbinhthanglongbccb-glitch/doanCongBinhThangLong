const { AppError } = require("../utils/errors");
const logger = require("../utils/logger");
const { captureException } = require("../utils/sentry");

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isKnownError = err instanceof AppError;
  const statusCode = isKnownError ? err.statusCode : 500;
  const message = isKnownError ? err.message : "Internal server error";
  const code = isKnownError ? err.code : "INTERNAL_SERVER_ERROR";
  const details = isKnownError ? err.details || null : null;

  const logContext = {
    action: "REQUEST_ERROR",
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.user?.userId || null,
    requestId: req.requestId || null,
    statusCode,
    errorName: err.name,
    errorMessage: err.message,
  };

  // Include stack trace for non-known errors (500s)
  if (!isKnownError || statusCode >= 500) {
    logContext.errorStack = err.stack;
  }

  logger.error(logContext, "Request failed");

  if (!isKnownError || statusCode >= 500) {
    captureException(err, {
      tags: {
        requestId: req.requestId || null,
        endpoint: req.originalUrl,
        method: req.method,
        statusCode,
      },
      user: {
        id: req.user?.userId || undefined,
      },
    });
  }

  return res.status(statusCode).json({
    message,
    code,
    details,
  });
};

module.exports = errorMiddleware;
