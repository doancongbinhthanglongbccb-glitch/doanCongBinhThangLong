const MediaAsset = require("../../../models/MediaAsset");

const create = async (payload) => {
  return MediaAsset.create(payload);
};

const listLatestLean = async ({ limit }) => {
  return MediaAsset.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

module.exports = {
  create,
  listLatestLean,
};
