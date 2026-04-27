/**
 * User roles & role-checking helpers.
 *
 * Mirrors the `UserRole` enum + `User.has_role()` pattern from
 * `website_lu_doan/backend/app/db/models/user.py`. Keeping the enum and the
 * comparison logic in one place means routes and services stop relying on
 * raw `"admin" | "editor"` literals scattered through the codebase.
 *
 * Hierarchy: ADMIN automatically passes any role check (admin > editor > viewer).
 */

const UserRole = Object.freeze({
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
});

/** Set of all valid role values, used by validators and tests. */
const ALL_ROLES = new Set(Object.values(UserRole));

/** Numeric rank used for hierarchy comparisons. Higher rank = more access. */
const ROLE_RANK = Object.freeze({
  [UserRole.ADMIN]: 100,
  [UserRole.EDITOR]: 50,
  [UserRole.VIEWER]: 10,
});

const isValidRole = (role) => typeof role === "string" && ALL_ROLES.has(role);

/**
 * Return true when `userRole` satisfies `requiredRole`.
 *
 * Rules:
 *   - Missing `requiredRole` => always true (public access).
 *   - Admin satisfies every role check.
 *   - Otherwise we compare ranks: actor must be at least as privileged as
 *     the requirement.
 */
const hasRole = (userRole, requiredRole) => {
  if (!requiredRole) {
    return true;
  }

  if (!isValidRole(userRole) || !isValidRole(requiredRole)) {
    return false;
  }

  if (userRole === UserRole.ADMIN) {
    return true;
  }

  return (ROLE_RANK[userRole] || 0) >= (ROLE_RANK[requiredRole] || 0);
};

module.exports = {
  UserRole,
  ALL_ROLES,
  ROLE_RANK,
  isValidRole,
  hasRole,
};
