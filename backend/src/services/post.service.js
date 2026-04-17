const mongoose = require("mongoose");
const Post = require("../models/Post");
const { BadRequestError, ForbiddenError, NotFoundError } = require("../utils/errors");
const logger = require("../utils/logger");

const buildSlug = (title) =>
  String(title || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let sequence = 1;

  while (true) {
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const exists = await Post.exists(query);
    if (!exists) {
      return slug;
    }

    sequence += 1;
    slug = `${baseSlug}-${sequence}`;
  }
};

const getPublishedPosts = async ({ page = 1, limit = 10, search = "" }) => {
  const numericPage = Number.isNaN(Number(page)) ? 1 : Math.max(1, Number(page));
  const numericLimit = Number.isNaN(Number(limit)) ? 10 : Math.min(100, Math.max(1, Number(limit)));

  const filter = { status: "published" };
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const [items, total] = await Promise.all([
    Post.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit)
      .populate("author", "username role"),
    Post.countDocuments(filter),
  ]);

  return {
    data: items,
    pagination: {
      page: numericPage,
      limit: numericLimit,
      total,
      totalPages: Math.ceil(total / numericLimit),
    },
  };
};

const getPublishedPostBySlug = async (slug) => {
  const post = await Post.findOne({ slug, status: "published" }).populate("author", "username role");

  if (!post) {
    throw new NotFoundError("Post not found");
  }

  return post;
};

const getCmsPosts = async () =>
  Post.find()
    .sort({ updatedAt: -1, createdAt: -1 })
    .populate("author", "username role");

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

  const slug = await ensureUniqueSlug(baseSlug);

  const createdPost = await Post.create({
    title,
    slug,
    content,
    thumbnail: payload?.thumbnail || "",
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
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("Invalid post id");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const isAdmin = user.role === "admin";
  const isEditorOwner = user.role === "editor" && String(post.author) === String(user.userId);

  if (!isAdmin && !isEditorOwner) {
    throw new ForbiddenError("You can only edit your own posts");
  }

  if (payload?.title !== undefined) {
    const nextTitle = String(payload.title).trim();
    if (!nextTitle) {
      throw new BadRequestError("Title cannot be empty");
    }

    post.title = nextTitle;

    const candidate = buildSlug(payload?.slug || nextTitle);
    if (!candidate) {
      throw new BadRequestError("Unable to generate slug from title");
    }

    post.slug = await ensureUniqueSlug(candidate, post._id);
  } else if (payload?.slug !== undefined) {
    const candidate = buildSlug(payload.slug);
    if (!candidate) {
      throw new BadRequestError("Invalid slug");
    }

    post.slug = await ensureUniqueSlug(candidate, post._id);
  }

  if (payload?.content !== undefined) {
    const nextContent = String(payload.content).trim();
    if (!nextContent) {
      throw new BadRequestError("Content cannot be empty");
    }
    post.content = nextContent;
  }

  if (payload?.thumbnail !== undefined) {
    post.thumbnail = String(payload.thumbnail || "").trim();
  }

  // Editors can only save drafts. Admin can set either draft or published.
  if (payload?.status !== undefined) {
    if (user.role !== "admin") {
      throw new ForbiddenError("Only admin can change post status");
    }

    if (!["draft", "published"].includes(payload.status)) {
      throw new BadRequestError("Status must be draft or published");
    }

    post.status = payload.status;
    post.publishedAt = payload.status === "published" ? post.publishedAt || new Date() : null;
  }

  await post.save();

  logger.info(
    {
      action: "UPDATE_POST",
      endpoint: context.endpoint || null,
      userId: user.userId,
      targetId: String(post._id),
      status: post.status,
    },
    "Post updated"
  );

  return post;
};

const publishPost = async (postId, user, context = {}) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("Invalid post id");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  post.status = "published";
  post.publishedAt = new Date();
  await post.save();

  logger.info(
    {
      action: "PUBLISH_POST",
      endpoint: context.endpoint || null,
      userId: user?.userId || null,
      targetId: String(post._id),
    },
    "Post published"
  );

  return post;
};

const deletePost = async (postId, user, context = {}) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("Invalid post id");
  }

  const deleted = await Post.findByIdAndDelete(postId);
  if (!deleted) {
    throw new NotFoundError("Post not found");
  }

  logger.info(
    {
      action: "DELETE_POST",
      endpoint: context.endpoint || null,
      userId: user?.userId || null,
      targetId: String(deleted._id),
    },
    "Post deleted"
  );
};

module.exports = {
  getPublishedPosts,
  getPublishedPostBySlug,
  getCmsPosts,
  createPost,
  updatePost,
  publishPost,
  deletePost,
};
