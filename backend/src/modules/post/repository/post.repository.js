const mongoose = require("mongoose");
const Post = require("../../../models/Post");
const { BadRequestError } = require("../../../utils/errors");
const { buildPostFilter, buildSort, normalizeListQuery, buildSlug } = require("../domain/post-utils");
const Category = require("../../../models/Category");

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
      .select("title slug status author createdAt updatedAt publishedAt thumbnail excerpt seoTitle seoDescription viewCount categoryIds")
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

module.exports = {
  listPosts,
  findById,
  findBySlug,
  findPublishedBySlug,
  findAll,
  create,
  updateById,
  ensureUniqueSlug,
  deleteById,
};
