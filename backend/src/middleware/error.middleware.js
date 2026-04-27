const { AppError } = require("../utils/errors");
const logger = require("../utils/logger");
const { captureException } = require("../utils/sentry");

/**
 * Build the canonical error response body.
 *
 * Shape: `{ error: { code, message, details? } }`
 * `details` is omitted (undefined) when not provided to keep payloads small.
 */
const buildErrorBody = ({ code, message, details }) => {
  const body = {
    error: {
      code,
      message,
    },
  };

  if (details !== undefined && details !== null) {
    body.error.details = details;
  }

  return body;
};

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isKnownError = err instanceof AppError;
  const statusCode = isKnownError ? err.statusCode : 500;
  const message = isKnownError ? err.message : "Internal server error";
  const code = isKnownError ? err.code : "INTERNAL_ERROR";
  const details = isKnownError ? err.details ?? null : null;

  const logContext = {
    action: "REQUEST_ERROR",
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.user?.userId || null,
    requestId: req.requestId || null,
    statusCode,
    errorCode: code,
    errorName: err.name,
    errorMessage: err.message,
  };

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
        errorCode: code,
      },
      user: {
        id: req.user?.userId || undefined,
      },
    });
  }

  return res.status(statusCode).json(buildErrorBody({ code, message, details }));
};

module.exports = errorMiddleware;
module.exports.buildErrorBody = buildErrorBody;
