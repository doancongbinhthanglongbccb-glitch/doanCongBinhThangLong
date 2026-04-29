const express = require("express");
const {
  getPosts,
  getCmsPosts,
  getCmsPostById,
  getPostBySlug,
  listRevisions,
  getRevisionDetail,
  restoreRevision,
  createPost,
  updatePost,
  submitPost,
  approvePost,
  rejectPost,
  publishPost,
  unpublishPost,
  deletePost,
} = require("../controller/post.controller");
const authMiddleware = require("../../../middleware/auth.middleware");
const requireRole = require("../../../middleware/role.middleware");
const { validateBody } = require("../../../middleware/validate.middleware");
const { createPostSchema, updatePostSchema, rejectPostSchema } = require("../../../validation/post.validation");
const { UserRole } = require("../../../domain/roles");

const router = express.Router();

// Editor (or higher) is the minimum bar for CMS access; admin auto-passes
// thanks to the role hierarchy in `domain/roles.js::hasRole`.
router.get("/", getPosts);
router.get("/cms", authMiddleware, requireRole(UserRole.EDITOR), getCmsPosts);
// CMS-only read-by-id route must not clash with public slug route.
router.get("/cms/:id", authMiddleware, requireRole(UserRole.EDITOR), getCmsPostById);

// Revision history
// Note: Express 5 uses `router` (path-to-regexp v6) which doesn't support inline regex like
// `:id([0-9a-f]{24})` in this codebase. Rely on explicit segments + ObjectId validation
// in repository/service instead.
router.get("/cms/:id/revisions", authMiddleware, requireRole(UserRole.EDITOR), listRevisions);
router.get("/cms/:id/revisions/:revId", authMiddleware, requireRole(UserRole.EDITOR), getRevisionDetail);
router.post("/cms/:id/revisions/:revId/restore", authMiddleware, requireRole(UserRole.ADMIN), restoreRevision);

router.get("/:slug", getPostBySlug);

router.post("/", authMiddleware, requireRole(UserRole.EDITOR), validateBody(createPostSchema), createPost);
router.put("/:id", authMiddleware, requireRole(UserRole.EDITOR), validateBody(updatePostSchema), updatePost);

// Workflow endpoints (production-grade CMS building blocks)
router.post("/:id/submit", authMiddleware, requireRole(UserRole.EDITOR), submitPost);
router.post("/:id/approve", authMiddleware, requireRole(UserRole.ADMIN), approvePost);
router.post("/:id/reject", authMiddleware, requireRole(UserRole.ADMIN), validateBody(rejectPostSchema), rejectPost);
router.put("/:id/publish", authMiddleware, requireRole(UserRole.ADMIN), publishPost);
router.post("/:id/unpublish", authMiddleware, requireRole(UserRole.ADMIN), unpublishPost);
router.delete("/:id", authMiddleware, requireRole(UserRole.ADMIN), deletePost);

module.exports = router;
