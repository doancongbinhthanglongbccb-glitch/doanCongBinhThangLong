const { BadRequestError, ForbiddenError, NotFoundError } = require("../../../utils/errors");
const logger = require("../../../utils/logger");
const { buildSlug } = require("../domain/post-utils");
const postRepository = require("../repository/post.repository");
const mongoose = require("mongoose");

const getPublishedPosts = async (query) => {
  return postRepository.listPosts({ ...query, includeDrafts: false });
};

const getPublishedPostBySlug = async (slug) => {
  const post = await postRepository.findPublishedBySlug(slug);

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  return post;
};

const getCmsPosts = async (query = {}) => {
  return postRepository.listPosts({ ...query, includeDrafts: true });
};

const getAllCmsPosts = async () => {
  return postRepository.findAll();
};

const createPost = async (payload, user, context = {}) => {
  const title = (payload?.title || "").trim();
  const content = (payload?.content || "").trim();

  if (!title || !content) {
    throw new BadRequestError("Title and content are required");
  }

  const providedStatus = payload?.status;
  const status = user.role === "admin" && providedStatus === "published" ? "published" : "draft";
  const baseSlug = buildSlug(payload?.slug || title);

  if (!baseSlug) {
    throw new BadRequestError("Unable to generate slug from title");
  }

  const slug = await postRepository.ensureUniqueSlug(baseSlug);

  const categoryIdsRaw = payload?.categoryIds || [];
  const categoryIds = Array.isArray(categoryIdsRaw)
    ? categoryIdsRaw
        .map((id) => String(id || "").trim())
        .filter(Boolean)
        .map((id) => {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestError("Invalid category id");
          }
          return new mongoose.Types.ObjectId(id);
        })
    : [];

  const createdPost = await postRepository.create({
    title,
    slug,
    content,
    thumbnail: payload?.thumbnail || "",
    categoryIds,
    excerpt: String(payload?.excerpt || "").trim(),
    seoTitle: String(payload?.seoTitle || "").trim(),
    seoDescription: String(payload?.seoDescription || "").trim(),
    viewCount: 0,
    author: user.userId,
    status,
    publishedAt: status === "published" ? new Date() : null,
  });

  logger.info(
    {
      action: "CREATE_POST",
      endpoint: context.endpoint || null,
      userId: user.userId,
      targetId: String(createdPost._id),
      status: createdPost.status,
    },
    "Post created"
  );

  return createdPost;
};

const updatePost = async (postId, payload, user, context = {}) => {
  const post = await postRepository.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const isAdmin = user.role === "admin";
  const isEditorOwner = user.role === "editor" && String(post.author) === String(user.userId);

  if (!isAdmin && !isEditorOwner) {
    throw new ForbiddenError("You can only edit your own posts");
  }

  const updates = {};

  if (payload?.title !== undefined) {
    const nextTitle = String(payload.title).trim();
    if (!nextTitle) {
      throw new BadRequestError("Title cannot be empty");
    }

    updates.title = nextTitle;

    const candidate = buildSlug(payload?.slug || nextTitle);
    if (!candidate) {
      throw new BadRequestError("Unable to generate slug from title");
    }

    updates.slug = await postRepository.ensureUniqueSlug(candidate, postId);
  } else if (payload?.slug !== undefined) {
    const candidate = buildSlug(payload.slug);
    if (!candidate) {
      throw new BadRequestError("Invalid slug");
    }

    updates.slug = await postRepository.ensureUniqueSlug(candidate, postId);
  }

  if (payload?.content !== undefined) {
    const nextContent = String(payload.content).trim();
    if (!nextContent) {
      throw new BadRequestError("Content cannot be empty");
    }
    updates.content = nextContent;
  }

  if (payload?.thumbnail !== undefined) {
    updates.thumbnail = String(payload.thumbnail || "").trim();
  }

  if (payload?.categoryIds !== undefined) {
    const raw = payload.categoryIds || [];
    if (!Array.isArray(raw)) {
      throw new BadRequestError("categoryIds must be an array");
    }
    updates.categoryIds = raw
      .map((id) => String(id || "").trim())
      .filter(Boolean)
      .map((id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new BadRequestError("Invalid category id");
        }
        return new mongoose.Types.ObjectId(id);
      });
  }

  if (payload?.excerpt !== undefined) {
    updates.excerpt = String(payload.excerpt || "").trim();
  }

  if (payload?.seoTitle !== undefined) {
    updates.seoTitle = String(payload.seoTitle || "").trim();
  }

  if (payload?.seoDescription !== undefined) {
    updates.seoDescription = String(payload.seoDescription || "").trim();
  }

  if (payload?.status !== undefined) {
    if (user.role !== "admin") {
      throw new ForbiddenError("Only admin can change post status");
    }

    if (!["draft", "published", "archived"].includes(payload.status)) {
      throw new BadRequestError("Status must be draft, published, or archived");
    }

    updates.status = payload.status;
    updates.publishedAt = payload.status === "published" ? post.publishedAt || new Date() : null;
  }

  const updatedPost = await postRepository.updateById(postId, updates);

  logger.info(
    {
      action: "UPDATE_POST",
      endpoint: context.endpoint || null,
      userId: user.userId,
      targetId: String(postId),
      status: updatedPost.status,
    },
    "Post updated"
  );

  return updatedPost;
};

const publishPost = async (postId, user, context = {}) => {
  const post = await postRepository.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const updatedPost = await postRepository.updateById(postId, {
    status: "published",
    publishedAt: new Date(),
  });

  logger.info(
    {
      action: "PUBLISH_POST",
      endpoint: context.endpoint || null,
      userId: user?.userId || null,
      targetId: String(postId),
    },
    "Post published"
  );

  return updatedPost;
};

const deletePost = async (postId, user, context = {}) => {
  const deleted = await postRepository.deleteById(postId);
  if (!deleted) {
    throw new NotFoundError("Post not found");
  }

  logger.info(
    {
      action: "DELETE_POST",
      endpoint: context.endpoint || null,
      userId: user?.userId || null,
      targetId: String(postId),
    },
    "Post deleted"
  );
};

module.exports = {
  getPublishedPosts,
  getPublishedPostBySlug,
  getCmsPosts,
  getAllCmsPosts,
  createPost,
  updatePost,
  publishPost,
  deletePost,
};
