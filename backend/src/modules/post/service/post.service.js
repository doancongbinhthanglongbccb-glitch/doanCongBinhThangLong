const { BadRequestError, ForbiddenError, NotFoundError } = require("../../../utils/errors");
const logger = require("../../../utils/logger");
const { buildSlug } = require("../domain/post-utils");
const postRepository = require("../repository/post.repository");
const mongoose = require("mongoose");

const statusToWorkflow = (status) => {
  if (status === "published") return "published";
  if (status === "archived") return "archived";
  return "draft";
};

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

const getCmsPostById = async (postId, user) => {
  const post = await postRepository.findByIdLean(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const isAdmin = user.role === "admin";
  const isEditorOwner = user.role === "editor" && String(post.author?._id || post.author) === String(user.userId);
  if (!isAdmin && !isEditorOwner) {
    throw new ForbiddenError("You can only view your own posts");
  }

  return post;
};

const createPost = async (payload, user, context = {}) => {
  const title = (payload?.title || "").trim();
  const content = (payload?.content || "").trim();

  if (!title || !content) {
    throw new BadRequestError("Title and content are required");
  }

  const providedStatus = payload?.status;
  const status = user.role === "admin" && providedStatus === "published" ? "published" : "draft";
  const workflowStatus = statusToWorkflow(status);
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
    workflowStatus,
    publishedAt: status === "published" ? new Date() : null,
  });

  await postRepository.createRevisionForPost({
    postId: createdPost._id,
    actorId: user.userId,
    action: "create",
    note: "",
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
    updates.workflowStatus = statusToWorkflow(payload.status);
  }

  const updatedPost = await postRepository.updateById(postId, updates);

  await postRepository.createRevisionForPost({
    postId,
    actorId: user.userId,
    action: "edit",
    note: "",
  });

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

const submitPostForReview = async (postId, user, context = {}) => {
  const post = await postRepository.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const isAdmin = user.role === "admin";
  const isEditorOwner = user.role === "editor" && String(post.author) === String(user.userId);
  if (!isAdmin && !isEditorOwner) {
    throw new ForbiddenError("You can only submit your own posts");
  }

  const currentWorkflow = post.workflowStatus || statusToWorkflow(post.status);
  if (!["draft", "rejected"].includes(currentWorkflow)) {
    throw new BadRequestError(
      "Only draft or rejected posts can be submitted for review",
      { workflowStatus: currentWorkflow },
      "INVALID_WORKFLOW_TRANSITION"
    );
  }

  const updatedPost = await postRepository.updateById(postId, {
    workflowStatus: "pending",
    "review.submittedAt": new Date(),
    "review.submittedBy": user.userId,
    "review.reviewedAt": null,
    "review.reviewedBy": null,
    "review.decisionNote": "",
  });

  await postRepository.createRevisionForPost({
    postId,
    actorId: user.userId,
    action: "submit",
    note: "",
  });

  logger.info(
    {
      action: "SUBMIT_POST",
      endpoint: context.endpoint || null,
      userId: user.userId,
      targetId: String(postId),
    },
    "Post submitted for review"
  );

  return updatedPost;
};

const approvePost = async (postId, user, context = {}) => {
  const post = await postRepository.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const currentWorkflow = post.workflowStatus || statusToWorkflow(post.status);
  if (currentWorkflow !== "pending") {
    throw new BadRequestError("Only pending posts can be approved", { workflowStatus: currentWorkflow }, "INVALID_WORKFLOW_TRANSITION");
  }

  const updatedPost = await postRepository.updateById(postId, {
    workflowStatus: "approved",
    "review.reviewedAt": new Date(),
    "review.reviewedBy": user.userId,
  });

  await postRepository.createRevisionForPost({
    postId,
    actorId: user.userId,
    action: "approve",
    note: "",
  });

  logger.info(
    {
      action: "APPROVE_POST",
      endpoint: context.endpoint || null,
      userId: user.userId,
      targetId: String(postId),
    },
    "Post approved"
  );

  return updatedPost;
};

const rejectPost = async (postId, payload, user, context = {}) => {
  const note = String(payload?.note || "").trim();
  if (!note) {
    throw new BadRequestError("Rejection note is required");
  }

  const post = await postRepository.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const currentWorkflow = post.workflowStatus || statusToWorkflow(post.status);
  if (currentWorkflow !== "pending") {
    throw new BadRequestError("Only pending posts can be rejected", { workflowStatus: currentWorkflow }, "INVALID_WORKFLOW_TRANSITION");
  }

  const updatedPost = await postRepository.updateById(postId, {
    workflowStatus: "rejected",
    "review.reviewedAt": new Date(),
    "review.reviewedBy": user.userId,
    "review.decisionNote": note,
  });

  await postRepository.createRevisionForPost({
    postId,
    actorId: user.userId,
    action: "reject",
    note,
  });

  logger.info(
    {
      action: "REJECT_POST",
      endpoint: context.endpoint || null,
      userId: user.userId,
      targetId: String(postId),
    },
    "Post rejected"
  );

  return updatedPost;
};

const publishPost = async (postId, user, context = {}) => {
  const post = await postRepository.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const currentWorkflow = post.workflowStatus || statusToWorkflow(post.status);
  // Simplified workflow for CMS v1: publish only from pending.
  if (currentWorkflow !== "pending") {
    throw new BadRequestError(
      "Only pending posts can be published",
      { workflowStatus: currentWorkflow },
      "INVALID_WORKFLOW_TRANSITION"
    );
  }

  const updatedPost = await postRepository.updateById(postId, {
    status: "published",
    workflowStatus: "published",
    publishedAt: new Date(),
  });

  await postRepository.createRevisionForPost({
    postId,
    actorId: user?.userId || null,
    action: "publish",
    note: "",
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

const unpublishPost = async (postId, user, context = {}) => {
  const post = await postRepository.findById(postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const currentWorkflow = post.workflowStatus || statusToWorkflow(post.status);
  if (currentWorkflow !== "published") {
    throw new BadRequestError("Only published posts can be unpublished", { workflowStatus: currentWorkflow }, "INVALID_WORKFLOW_TRANSITION");
  }

  const updatedPost = await postRepository.updateById(postId, {
    status: "draft",
    workflowStatus: "draft",
    publishedAt: null,
  });

  await postRepository.createRevisionForPost({
    postId,
    actorId: user.userId,
    action: "unpublish",
    note: "",
  });

  logger.info(
    {
      action: "UNPUBLISH_POST",
      endpoint: context.endpoint || null,
      userId: user.userId,
      targetId: String(postId),
    },
    "Post unpublished"
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

const listRevisions = async (postId, user) => {
  // Editors can view revisions for their own posts; admin can view all.
  const post = await postRepository.findById(postId);
  if (!post) throw new NotFoundError("Post not found");

  const isAdmin = user.role === "admin";
  const isEditorOwner = user.role === "editor" && String(post.author) === String(user.userId);
  if (!isAdmin && !isEditorOwner) {
    throw new ForbiddenError("You can only view revisions of your own posts");
  }

  return postRepository.listRevisions(postId);
};

const getRevisionDetail = async (postId, revId, user) => {
  // Same permission as listRevisions
  await listRevisions(postId, user);
  const revision = await postRepository.findRevisionById(postId, revId);
  if (!revision) throw new NotFoundError("Revision not found");
  return revision;
};

const restoreRevision = async (postId, revId, user, context = {}) => {
  if (user.role !== "admin") {
    throw new ForbiddenError("Only admin can restore revisions");
  }

  const restored = await postRepository.restoreRevision({ postId, revisionId: revId, actorId: user.userId });

  logger.info(
    {
      action: "RESTORE_REVISION",
      endpoint: context.endpoint || null,
      userId: user.userId,
      targetId: String(postId),
      revisionId: String(revId),
    },
    "Revision restored"
  );

  return restored;
};

module.exports = {
  getPublishedPosts,
  getPublishedPostBySlug,
  getCmsPosts,
  getAllCmsPosts,
  getCmsPostById,
  createPost,
  updatePost,
  submitPostForReview,
  approvePost,
  rejectPost,
  publishPost,
  unpublishPost,
  deletePost,
  listRevisions,
  getRevisionDetail,
  restoreRevision,
};
