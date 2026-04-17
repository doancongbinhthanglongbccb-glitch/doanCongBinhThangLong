const express = require("express");
const {
  getPosts,
  getCmsPosts,
  getPostBySlug,
  createPost,
  updatePost,
  publishPost,
  deletePost,
} = require("../controllers/post.controller");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const { validateBody } = require("../middleware/validate.middleware");
const { createPostSchema, updatePostSchema } = require("../validation/post.validation");

const router = express.Router();

router.get("/", getPosts);
router.get("/cms", authMiddleware, requireRole(["admin", "editor"]), getCmsPosts);
router.get("/:slug", getPostBySlug);

router.post("/", authMiddleware, requireRole(["admin", "editor"]), validateBody(createPostSchema), createPost);
router.put("/:id", authMiddleware, requireRole(["admin", "editor"]), validateBody(updatePostSchema), updatePost);
router.put("/:id/publish", authMiddleware, requireRole(["admin"]), publishPost);
router.delete("/:id", authMiddleware, requireRole(["admin"]), deletePost);

module.exports = router;
