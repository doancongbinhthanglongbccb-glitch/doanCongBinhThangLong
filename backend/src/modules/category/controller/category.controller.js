const asyncHandler = require("../../../utils/asyncHandler");
const categoryService = require("../service/category.service");

const listCategories = asyncHandler(async (req, res) => {
  const items = await categoryService.listCategories();
  return res.status(200).json({ items });
});

const getCategoryTree = asyncHandler(async (req, res) => {
  const visibleOnly = req.query.visible === "false" ? false : true;
  const tree = await categoryService.getCategoryTree({ visibleOnly });
  return res.status(200).json({ items: tree });
});

const createCategory = asyncHandler(async (req, res) => {
  const created = await categoryService.createCategory(req.body);
  return res.status(201).json(created);
});

const updateCategory = asyncHandler(async (req, res) => {
  const updated = await categoryService.updateCategory(req.params.id, req.body);
  return res.status(200).json(updated);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const force = req.query.force === "true";
  await categoryService.deleteCategory(req.params.id, { force });
  return res.status(204).send();
});

module.exports = {
  listCategories,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
};
