const Category = require("../models/Category");

module.exports = {
  id: "20260427_0002_sync_category_indexes",
  up: async () => {
    await Category.syncIndexes();
  },
};
