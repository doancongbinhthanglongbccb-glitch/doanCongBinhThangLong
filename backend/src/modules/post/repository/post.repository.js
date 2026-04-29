const mongoose = require("mongoose");
const Post = require("../../../models/Post");
const { BadRequestError } = require("../../../utils/errors");
const { buildPostFilter, buildSort, normalizeListQuery, buildSlug } = require("../domain/post-utils");
const Category = require("../../../models/Category");
const PostRevision = require("../../../models/PostRevision");

const listPosts = async ({ includeDrafts = false, ...rawQuery } = {}) => {
  const query = normalizeListQuery(rawQuery);
  let categoryObjectId = null;

  if (query.categoryId) {
    if (!mongoose.Types.ObjectId.isValid(query.categoryId)) {
      throw new BadRequestError("Invalid category id");
    }
    categoryObjectId = new mongoose.Types.ObjectId(query.categoryId);
  } else if (query.categorySlug) {
    const category = await Category.findOne({ slug: query.categorySlug }).select({ _id: 1 }).lean();
    if (!category) {
      // No such category => empty result set (consistent for public pages).
      return { items: [], total: 0, page: query.page, size: query.limit, pages: 1 };
    }
    categoryObjectId = category._id;
  }

  const filter = buildPostFilter({ ...query, includeDrafts, categoryObjectId });
  const sort = buildSort(query.sort);

  const [items, total] = await Promise.all([
    Post.find(filter)
      .sort(sort)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .select(
        "title slug status workflowStatus author createdAt updatedAt publishedAt thumbnail excerpt seoTitle seoDescription viewCount categoryIds revision review"
      )
      .populate("author", "username role")
      .lean(),
    Post.countDocuments(filter),
  ]);

  // Canonical pagination shape (mirrors `website_lu_doan` PostList):
  //   { items, total, page, size, pages }
  return {
    items,
    total,
    page: query.page,
    size: query.limit,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  };
};

const findById = async (postId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("Invalid post id");
  }

  return Post.findById(postId).populate("author", "username role");
};

const findByIdLean = async (postId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("Invalid post id");
  }

  return Post.findById(postId).populate("author", "username role").lean();
};

const findBySlug = async (slug) => {
  return Post.findOne({ slug }).populate("author", "username role");
};

const findPublishedBySlug = async (slug) => {
  return Post.findOne({ slug, status: "published" }).populate("author", "username role");
};

const findAll = async () => {
  return Post.find()
    .sort({ updatedAt: -1, createdAt: -1 })
    .populate("author", "username role");
};

const create = async (data) => {
  return Post.create(data);
};

const updateById = async (postId, data) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("Invalid post id");
  }

  return Post.findByIdAndUpdate(postId, data, { new: true }).populate("author", "username role");
};

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

const deleteById = async (postId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("Invalid post id");
  }

  return Post.findByIdAndDelete(postId);
};

const snapshotFromPost = (post) => ({
  title: post.title,
  slug: post.slug,
  content: post.content,
  thumbnail: post.thumbnail || "",
  categoryIds: post.categoryIds || [],
  excerpt: post.excerpt || "",
  seoTitle: post.seoTitle || "",
  seoDescription: post.seoDescription || "",
  status: post.status,
  workflowStatus: post.workflowStatus || (post.status === "published" ? "published" : post.status),
  publishedAt: post.publishedAt || null,
});

const listRevisions = async (postId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("Invalid post id");
  }

  return PostRevision.find({ postId })
    .sort({ version: -1 })
    .select("version action note createdAt actorId")
    .populate("actorId", "username role")
    .lean();
};

const findRevisionById = async (postId, revisionId) => {
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    throw new BadRequestError("Invalid post id");
  }
  if (!mongoose.Types.ObjectId.isValid(revisionId)) {
    throw new BadRequestError("Invalid revision id");
  }

  return PostRevision.findOne({ _id: revisionId, postId })
    .populate("actorId", "username role")
    .lean();
};

const restoreRevision = async ({ postId, revisionId, actorId }) => {
  const rev = await findRevisionById(postId, revisionId);
  if (!rev) {
    throw new BadRequestError("Revision not found", { revisionId }, "REVISION_NOT_FOUND");
  }

  // Restore snapshot onto current post. Keep safety: do not restore viewCount, author, timestamps.
  const patch = {
    title: rev.snapshot.title,
    slug: rev.snapshot.slug,
    content: rev.snapshot.content,
    thumbnail: rev.snapshot.thumbnail || "",
    categoryIds: rev.snapshot.categoryIds || [],
    excerpt: rev.snapshot.excerpt || "",
    seoTitle: rev.snapshot.seoTitle || "",
    seoDescription: rev.snapshot.seoDescription || "",
    status: rev.snapshot.status,
    workflowStatus: rev.snapshot.workflowStatus,
    publishedAt: rev.snapshot.publishedAt || null,
  };

  await Post.findByIdAndUpdate(postId, patch, { new: false });

  // Create a new revision capturing the restored state
  await createRevisionForPost({ postId, actorId, action: "restore", note: `restore:${rev.version}` });

  return rev;
};

const createRevisionForPost = async ({
  postId,
  actorId,
  action,
  note = "",
  session = null,
}) => {
  const post = await Post.findById(postId).session(session || undefined);
  if (!post) {
    throw new BadRequestError("Invalid post id");
  }

  const current = post.revision?.current || 0;
  const nextVersion = current + 1;

  await PostRevision.create(
    [
      {
        postId: post._id,
        version: nextVersion,
        actorId,
        action,
        note,
        snapshot: snapshotFromPost(post),
      },
    ],
    session ? { session } : undefined
  );

  const revisionPatch = { "revision.current": nextVersion };
  if (action === "publish") {
    revisionPatch["revision.lastPublished"] = nextVersion;
  }

  await Post.updateOne({ _id: post._id }, { $set: revisionPatch }).session(session || undefined);

  return nextVersion;
};

module.exports = {
  listPosts,
  findById,
  findByIdLean,
  findBySlug,
  findPublishedBySlug,
  findAll,
  create,
  updateById,
  ensureUniqueSlug,
  deleteById,
  createRevisionForPost,
  listRevisions,
  findRevisionById,
  restoreRevision,
};
