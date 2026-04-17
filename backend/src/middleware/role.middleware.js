const { ForbiddenError } = require("../utils/errors");

const requireRole = (allowedRoles) => (req, res, next) => {
  const role = req.user?.role;

  if (!role) {
    return next(new ForbiddenError("User role is missing"));
  }

  if (!allowedRoles.includes(role)) {
    return next(new ForbiddenError("You do not have permission to perform this action"));
  }

  return next();
};

module.exports = requireRole;
