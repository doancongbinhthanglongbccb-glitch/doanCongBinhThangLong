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

const escapeRegex = (value) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeListQuery = ({
  page = 1,
  limit = 10,
  search = "",
  status,
  author,
  sort = "newest",
  categoryId,
  categorySlug,
} = {}) => {
  const { BadRequestError } = require("../../../utils/errors");

  const parsedLimit = Number(limit);
  if (!Number.isNaN(parsedLimit) && parsedLimit > 100) {
    throw new BadRequestError("Limit must be less than or equal to 100");
  }

  const numericPage = Number.isNaN(Number(page)) ? 1 : Math.max(1, Number(page));
  const numericLimit = Number.isNaN(parsedLimit) ? 10 : Math.max(1, parsedLimit);

  return {
    page: numericPage,
    limit: numericLimit,
    search: String(search || "").trim(),
    status: status === "draft" || status === "published" || status === "archived" ? status : undefined,
    author: String(author || "").trim() || undefined,
    sort: sort === "oldest" ? "oldest" : "newest",
    categoryId: String(categoryId || "").trim() || undefined,
    categorySlug: String(categorySlug || "").trim() || undefined,
  };
};

const buildPostFilter = ({ search, status, author, includeDrafts, categoryObjectId }) => {
  const mongoose = require("mongoose");
  const { BadRequestError } = require("../../../utils/errors");

  const filter = {};

  if (!includeDrafts) {
    filter.status = "published";
  } else if (status) {
    filter.status = status;
  }

  if (categoryObjectId) {
    filter.categoryIds = categoryObjectId;
  }

  if (author) {
    if (!mongoose.Types.ObjectId.isValid(author)) {
      throw new BadRequestError("Invalid author id");
    }

    filter.author = new mongoose.Types.ObjectId(author);
  }

  const normalizedSearch = String(search || "");
  const trimmedSearch = normalizedSearch.trim();

  if (trimmedSearch.length > 100) {
    throw new BadRequestError("Search query is too long");
  }

  if (trimmedSearch) {
    const escaped = escapeRegex(trimmedSearch);
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { slug: { $regex: escaped, $options: "i" } },
    ];
  }

  return filter;
};

const buildSort = (sort) => {
  if (sort === "oldest") {
    return { createdAt: 1, _id: 1 };
  }

  return { createdAt: -1, _id: -1 };
};

module.exports = {
  buildSlug,
  escapeRegex,
  normalizeListQuery,
  buildPostFilter,
  buildSort,
};
