const express = require("express");
const {
  getPosts,
  getCmsPosts,
  getPostBySlug,
  createPost,
  updatePost,
  publishPost,
  deletePost,
} = require("../controller/post.controller");
const authMiddleware = require("../../../middleware/auth.middleware");
const requireRole = require("../../../middleware/role.middleware");
const { validateBody } = require("../../../middleware/validate.middleware");
const { createPostSchema, updatePostSchema } = require("../../../validation/post.validation");
const { UserRole } = require("../../../domain/roles");

const router = express.Router();

// Editor (or higher) is the minimum bar for CMS access; admin auto-passes
// thanks to the role hierarchy in `domain/roles.js::hasRole`.
router.get("/", getPosts);
router.get("/cms", authMiddleware, requireRole(UserRole.EDITOR), getCmsPosts);
router.get("/:slug", getPostBySlug);

router.post("/", authMiddleware, requireRole(UserRole.EDITOR), validateBody(createPostSchema), createPost);
router.put("/:id", authMiddleware, requireRole(UserRole.EDITOR), validateBody(updatePostSchema), updatePost);
router.put("/:id/publish", authMiddleware, requireRole(UserRole.ADMIN), publishPost);
router.delete("/:id", authMiddleware, requireRole(UserRole.ADMIN), deletePost);

module.exports = router;
