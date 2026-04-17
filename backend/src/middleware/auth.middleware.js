const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../utils/errors");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("Authorization token is required");
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw new UnauthorizedError("Invalid authorization format");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret is not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    return next(new UnauthorizedError("Invalid or expired token"));
  }
};

module.exports = authMiddleware;
