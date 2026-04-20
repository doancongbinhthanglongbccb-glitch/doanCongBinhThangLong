class AppError extends Error {
  constructor(message, statusCode, details = null, code = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.code = code || this.constructor.name.replace(/Error$/, "").toUpperCase();
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad request", details = null, code = "BAD_REQUEST") {
    super(message, 400, details, code);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, null, "UNAUTHORIZED");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, null, "FORBIDDEN");
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, null, "NOT_FOUND");
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
};
