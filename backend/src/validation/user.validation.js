const { z } = require("zod");

const updateUserRoleSchema = z
  .object({
    role: z.enum(["admin", "editor"]),
  })
  .strict();

module.exports = {
  updateUserRoleSchema,
};

