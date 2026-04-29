const { BadRequestError, ForbiddenError } = require("../../../utils/errors");
const logger = require("../../../utils/logger");
const userRepository = require("../repository/user.repository");

const ALLOWED_ROLES = new Set(["admin", "editor"]);

const listUsers = async (query = {}) => {
  return userRepository.listUsers(query);
};

const updateUserRole = async (targetUserId, nextRole, actor = {}) => {
  const normalizedRole = String(nextRole || "").trim();
  if (!ALLOWED_ROLES.has(normalizedRole)) {
    throw new BadRequestError("Invalid role");
  }

  const actorUserId = String(actor.userId || "");
  if (actorUserId && actorUserId === String(targetUserId)) {
    throw new ForbiddenError("You cannot change your own role");
  }

  const user = await userRepository.findById(targetUserId);
  if (!user) {
    throw new BadRequestError("User not found");
  }

  if (user.role === "admin" && normalizedRole !== "admin") {
    const admins = await userRepository.countAdmins();
    if (admins <= 1) {
      throw new ForbiddenError("Cannot remove the last admin");
    }
  }

  user.role = normalizedRole;
  await user.save();

  logger.info(
    {
      action: "USER_ROLE_UPDATED",
      actorUserId: actorUserId || null,
      targetUserId: String(user._id),
      role: normalizedRole,
      requestId: actor.requestId || null,
    },
    "User role updated"
  );

  return {
    id: String(user._id),
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

module.exports = {
  listUsers,
  updateUserRole,
};

