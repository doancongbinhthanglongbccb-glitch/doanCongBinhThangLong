const mongoose = require("mongoose");
const User = require("../../../models/User");
const { BadRequestError } = require("../../../utils/errors");

const normalizeListQuery = (raw = {}) => {
  const page = Math.max(1, Number(raw.page || 1) || 1);
  const limit = Math.max(1, Math.min(100, Number(raw.limit || 20) || 20));
  const search = String(raw.search || "").trim();
  const role = String(raw.role || "").trim();
  const sort = raw.sort === "oldest" ? "oldest" : "newest";

  return { page, limit, search, role, sort };
};

const buildFilter = (query) => {
  const filter = {};
  if (query.search) {
    // username currently holds email for Google users
    filter.username = { $regex: query.search, $options: "i" };
  }
  if (query.role) {
    filter.role = query.role;
  }
  return filter;
};

const listUsers = async (rawQuery = {}) => {
  const query = normalizeListQuery(rawQuery);
  const filter = buildFilter(query);
  const sort = query.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .select("username role createdAt updatedAt")
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    items: items.map((u) => ({
      id: String(u._id),
      username: u.username,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    })),
    total,
    page: query.page,
    size: query.limit,
    pages: Math.max(1, Math.ceil(total / query.limit)),
  };
};

const findById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError("Invalid user id");
  }
  return User.findById(id);
};

const countAdmins = async () => {
  return User.countDocuments({ role: "admin" });
};

module.exports = {
  listUsers,
  findById,
  countAdmins,
  normalizeListQuery,
};

