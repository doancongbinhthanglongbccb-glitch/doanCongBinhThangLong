/**
 * Frontend mirror of `backend/src/domain/roles.js`.
 *
 * Keeping the enum + comparison logic identical on both sides means the
 * client and the API agree on what "admin" / "editor" can do without
 * duplicating role-string literals across components.
 */

export const UserRole = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

export type Role = (typeof UserRole)[keyof typeof UserRole];

const ROLE_RANK: Record<Role, number> = {
  [UserRole.ADMIN]: 100,
  [UserRole.EDITOR]: 50,
  [UserRole.VIEWER]: 10,
};

export const ALL_ROLES = new Set<Role>(Object.values(UserRole));

export const isValidRole = (role: unknown): role is Role =>
  typeof role === "string" && ALL_ROLES.has(role as Role);

/**
 * Return true when `userRole` satisfies `requiredRole`.
 *
 * Mirrors `hasRole()` in the backend module:
 *   - missing `requiredRole` -> always true (public access),
 *   - admin satisfies every role check,
 *   - otherwise compare ranks (admin > editor > viewer).
 */
export const hasRole = (userRole: string | null | undefined, requiredRole?: Role): boolean => {
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
