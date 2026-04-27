/**
 * Domain exceptions.
 *
 * Pattern adopted from `website_lu_doan/backend/app/core/exceptions.py`:
 * Every error carries a `code` (machine-readable), `statusCode` (HTTP),
 * `message` (human-readable) and optional `details` (object/array).
 *
 * Use these in services & repositories instead of throwing plain `Error`,
 * so `error.middleware.js` can produce a consistent response body of
 * `{ error: { code, message, details } }`.
 */

class AppError extends Error {
  static code = "APP_ERROR";
  static statusCode = 500;

  constructor(message, statusCode, details = null, code = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || this.constructor.statusCode || 500;
    this.details = details;
    this.code = code || this.constructor.code || "APP_ERROR";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// === 4xx Client errors =====================================================

class BadRequestError extends AppError {
  static code = "BAD_REQUEST";
  static statusCode = 400;

  constructor(message = "Bad request", details = null, code = null) {
    super(message, BadRequestError.statusCode, details, code || BadRequestError.code);
  }
}

class AuthenticationError extends AppError {
  static code = "AUTHENTICATION_ERROR";
  static statusCode = 401;

  constructor(message = "Authentication failed", details = null, code = null) {
    super(message, AuthenticationError.statusCode, details, code || AuthenticationError.code);
  }
}

// Backward-compatible alias kept so existing tests and callers still work.
class UnauthorizedError extends AuthenticationError {
  static code = "UNAUTHORIZED";

  constructor(message = "Unauthorized", details = null, code = null) {
    super(message, details, code || UnauthorizedError.code);
  }
}

class ForbiddenError extends AppError {
  static code = "FORBIDDEN";
  static statusCode = 403;

  constructor(message = "Forbidden", details = null, code = null) {
    super(message, ForbiddenError.statusCode, details, code || ForbiddenError.code);
  }
}

class AuthorizationError extends ForbiddenError {
  static code = "AUTHORIZATION_ERROR";

  constructor(message = "Insufficient permissions", details = null, code = null) {
    super(message, details, code || AuthorizationError.code);
  }
}

class NotFoundError extends AppError {
  static code = "NOT_FOUND";
  static statusCode = 404;

  constructor(message = "Resource not found", details = null, code = null) {
    super(message, NotFoundError.statusCode, details, code || NotFoundError.code);
  }
}

class AlreadyExistsError extends AppError {
  static code = "ALREADY_EXISTS";
  static statusCode = 409;

  constructor(message = "Resource already exists", details = null, code = null) {
    super(message, AlreadyExistsError.statusCode, details, code || AlreadyExistsError.code);
  }
}

class ValidationError extends AppError {
  static code = "VALIDATION_ERROR";
  static statusCode = 422;

  constructor(message = "Validation error", details = null, code = null) {
    super(message, ValidationError.statusCode, details, code || ValidationError.code);
  }
}

class RateLimitError extends AppError {
  static code = "RATE_LIMIT_EXCEEDED";
  static statusCode = 429;

  constructor(message = "Rate limit exceeded", details = null, code = null) {
    super(message, RateLimitError.statusCode, details, code || RateLimitError.code);
  }
}

// === 5xx Server errors =====================================================

class InternalError extends AppError {
  static code = "INTERNAL_ERROR";
  static statusCode = 500;

  constructor(message = "Internal server error", details = null, code = null) {
    super(message, InternalError.statusCode, details, code || InternalError.code);
  }
}

class ExternalServiceError extends AppError {
  static code = "EXTERNAL_SERVICE_ERROR";
  static statusCode = 503;

  constructor(message = "External service unavailable", details = null, code = null) {
    super(message, ExternalServiceError.statusCode, details, code || ExternalServiceError.code);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  AuthenticationError,
  UnauthorizedError,
  ForbiddenError,
  AuthorizationError,
  NotFoundError,
  AlreadyExistsError,
  ValidationError,
  RateLimitError,
  InternalError,
  ExternalServiceError,
};
