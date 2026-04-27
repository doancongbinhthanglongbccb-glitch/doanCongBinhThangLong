const { buildSlug } = require("../../post/domain/post-utils");

/**
 * Build category slug; same rules as post slugs for consistency.
 */
const buildCategorySlug = (value) => buildSlug(value);

/**
 * Build a tree from a flat list of categories.
 * Each node: { ...category, children: [] }
 */
const buildCategoryTree = (categories = []) => {
  const byId = new Map();
  const roots = [];

  for (const c of categories) {
    const id = String(c._id || c.id);
    byId.set(id, { ...c, children: [] });
  }

  for (const c of categories) {
    const id = String(c._id || c.id);
    const node = byId.get(id);
    const parentId = c.parentId ? String(c.parentId) : "";

    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(node);
      continue;
    }

    roots.push(node);
  }

  const sortChildren = (node) => {
    node.children.sort((a, b) => (a.order || 0) - (b.order || 0) || String(a.name).localeCompare(String(b.name)));
    node.children.forEach(sortChildren);
  };

  roots.sort((a, b) => (a.order || 0) - (b.order || 0) || String(a.name).localeCompare(String(b.name)));
  roots.forEach(sortChildren);

  return roots;
};

module.exports = {
  buildCategorySlug,
  buildCategoryTree,
};
