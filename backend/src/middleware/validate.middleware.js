const { ZodError } = require("zod");
const { ValidationError } = require("../utils/errors");

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));

      return next(new ValidationError("Validation failed", issues));
    }

    return next(error);
  }
};

module.exports = {
  validateBody,
};
