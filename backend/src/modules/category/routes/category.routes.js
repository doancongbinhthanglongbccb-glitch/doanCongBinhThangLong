const express = require("express");
const authMiddleware = require("../../../middleware/auth.middleware");
const requireRole = require("../../../middleware/role.middleware");
const { validateBody } = require("../../../middleware/validate.middleware");
const { UserRole } = require("../../../domain/roles");
const { createCategorySchema, updateCategorySchema } = require("../../../validation/category.validation");
const {
  listCategories,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controller/category.controller");

const router = express.Router();

// Public
router.get("/tree", getCategoryTree);

// Admin
router.get("/", authMiddleware, requireRole(UserRole.ADMIN), listCategories);
router.post("/", authMiddleware, requireRole(UserRole.ADMIN), validateBody(createCategorySchema), createCategory);
router.put("/:id", authMiddleware, requireRole(UserRole.ADMIN), validateBody(updateCategorySchema), updateCategory);
router.delete("/:id", authMiddleware, requireRole(UserRole.ADMIN), deleteCategory);

module.exports = router;
