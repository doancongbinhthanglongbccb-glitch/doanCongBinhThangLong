const mongoose = require("mongoose");
const Category = require("../../../models/Category");

const findAllLean = () => Category.find().lean().sort({ order: 1, name: 1, _id: 1 });

const findVisibleLean = () => Category.find({ visible: true }).lean().sort({ order: 1, name: 1, _id: 1 });

const findById = (id) => Category.findById(id);

const findBySlugLean = (slug) => Category.findOne({ slug }).lean();

const existsBySlug = async (slug, excludeId = null) => {
  const filter = { slug };
  if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }
  const found = await Category.findOne(filter).select({ _id: 1 }).lean();
  return Boolean(found);
};

const create = (payload) => Category.create(payload);

const updateById = (id, updates) => Category.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

const deleteById = (id) => Category.findByIdAndDelete(id);

const countChildren = (parentId) => Category.countDocuments({ parentId });

module.exports = {
  findAllLean,
  findVisibleLean,
  findById,
  findBySlugLean,
  existsBySlug,
  create,
  updateById,
  deleteById,
  countChildren,
};
