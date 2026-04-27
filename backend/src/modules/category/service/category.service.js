const mongoose = require("mongoose");
const {
  BadRequestError,
  NotFoundError,
  AlreadyExistsError,
  ForbiddenError,
} = require("../../../utils/errors");
const categoryRepository = require("../repository/category.repository");
const { buildCategorySlug, buildCategoryTree } = require("../domain/category-utils");

const assertValidObjectIdOrNull = (value, field) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new BadRequestError(`Invalid ${field}`, { field });
  }

  return new mongoose.Types.ObjectId(value);
};

const listCategories = async () => categoryRepository.findAllLean();

const getCategoryTree = async ({ visibleOnly = true } = {}) => {
  const categories = visibleOnly ? await categoryRepository.findVisibleLean() : await categoryRepository.findAllLean();
  return buildCategoryTree(categories);
};

const createCategory = async (payload) => {
  const name = String(payload?.name || "").trim();
  if (!name) {
    throw new BadRequestError("Name is required");
  }

  const parentId = assertValidObjectIdOrNull(payload?.parentId, "parentId");
  if (parentId) {
    const parent = await categoryRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundError("Parent category not found");
    }
  }

  const baseSlug = buildCategorySlug(payload?.slug || name);
  if (!baseSlug) {
    throw new BadRequestError("Unable to generate slug from name");
  }

  const slugTaken = await categoryRepository.existsBySlug(baseSlug);
  if (slugTaken) {
    throw new AlreadyExistsError("Category slug already exists", { slug: baseSlug });
  }

  const created = await categoryRepository.create({
    name,
    slug: baseSlug,
    parentId: parentId || null,
    order: payload?.order ?? 0,
    visible: payload?.visible ?? true,
    description: String(payload?.description || "").trim(),
  });

  return created;
};

const updateCategory = async (categoryId, payload) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const updates = {};

  if (payload?.name !== undefined) {
    const nextName = String(payload.name || "").trim();
    if (!nextName) {
      throw new BadRequestError("Name cannot be empty");
    }
    updates.name = nextName;
  }

  if (payload?.slug !== undefined || payload?.name !== undefined) {
    const candidate = buildCategorySlug(payload?.slug || updates.name || category.name);
    if (!candidate) {
      throw new BadRequestError("Invalid slug");
    }
    const slugTaken = await categoryRepository.existsBySlug(candidate, String(category._id));
    if (slugTaken) {
      throw new AlreadyExistsError("Category slug already exists", { slug: candidate });
    }
    updates.slug = candidate;
  }

  if (payload?.description !== undefined) {
    updates.description = String(payload.description || "").trim();
  }

  if (payload?.order !== undefined) {
    const nextOrder = Number(payload.order);
    if (Number.isNaN(nextOrder) || nextOrder < 0) {
      throw new BadRequestError("Invalid order");
    }
    updates.order = nextOrder;
  }

  if (payload?.visible !== undefined) {
    updates.visible = Boolean(payload.visible);
  }

  if (payload?.parentId !== undefined) {
    const nextParentId = assertValidObjectIdOrNull(payload.parentId, "parentId");
    if (nextParentId && String(nextParentId) === String(category._id)) {
      throw new BadRequestError("Category cannot be its own parent");
    }

    if (nextParentId) {
      const parent = await categoryRepository.findById(nextParentId);
      if (!parent) {
        throw new NotFoundError("Parent category not found");
      }
    }

    updates.parentId = nextParentId || null;
  }

  const updated = await categoryRepository.updateById(categoryId, updates);
  if (!updated) {
    throw new NotFoundError("Category not found");
  }

  return updated;
};

const deleteCategory = async (categoryId, { force = false } = {}) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  const childrenCount = await categoryRepository.countChildren(category._id);
  if (childrenCount > 0 && !force) {
    throw new ForbiddenError("Category has child categories; delete children first or use force", {
      childrenCount,
    });
  }

  await categoryRepository.deleteById(categoryId);
};

module.exports = {
  listCategories,
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
};
