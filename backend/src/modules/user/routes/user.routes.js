const express = require("express");
const authMiddleware = require("../../../middleware/auth.middleware");
const requireRole = require("../../../middleware/role.middleware");
const { validateBody } = require("../../../middleware/validate.middleware");
const { UserRole } = require("../../../domain/roles");
const { updateUserRoleSchema } = require("../../../validation/user.validation");
const { listUsers, updateUserRole } = require("../controller/user.controller");

const router = express.Router();

// Admin-only user management
router.get("/", authMiddleware, requireRole(UserRole.ADMIN), listUsers);
router.patch("/:id/role", authMiddleware, requireRole(UserRole.ADMIN), validateBody(updateUserRoleSchema), updateUserRole);

module.exports = router;

