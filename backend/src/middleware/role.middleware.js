const { ForbiddenError } = require("../utils/errors");
const { hasRole, isValidRole } = require("../domain/roles");

/**
 * Express middleware factory for role-based access control.
 *
 * Accepts either:
 *   - a single role string: `requireRole(UserRole.EDITOR)` -> any caller with
 *     editor-or-higher rank passes (mirrors `RoleChecker` in the FastAPI
 *     reference project where admin satisfies every role).
 *   - an array of acceptable roles: `requireRole([UserRole.ADMIN, "moderator"])`.
 *     Each role is checked individually and admin always passes.
 *
 * The legacy `requireRole(["admin", "editor"])` call sites keep working via
 * the array branch, so callers can be migrated one by one.
 */
const requireRole = (allowed) => (req, res, next) => {
  const role = req.user?.role;

  if (!role) {
    return next(new ForbiddenError("User role is missing"));
  }

  if (Array.isArray(allowed)) {
    const passes = allowed.some((candidate) => hasRole(role, candidate));
    if (!passes) {
      return next(new ForbiddenError("You do not have permission to perform this action"));
    }
    return next();
  }

  if (!isValidRole(allowed)) {
    return next(new ForbiddenError("Invalid required role configuration"));
  }

  if (!hasRole(role, allowed)) {
    return next(new ForbiddenError("You do not have permission to perform this action"));
  }

  return next();
};

module.exports = requireRole;
