const MediaAsset = require("../../../models/MediaAsset");

const create = async (payload) => {
  return MediaAsset.create(payload);
};

const listPaginatedLean = async ({ filter, page, limit }) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    MediaAsset.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "username role")
      .lean(),
    MediaAsset.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    size: limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
};

const findById = async (id) => {
  return MediaAsset.findById(id).populate("createdBy", "username role");
};

const deleteById = async (id) => {
  return MediaAsset.findByIdAndDelete(id);
};

module.exports = {
  create,
  listPaginatedLean,
  findById,
  deleteById,
};
