const { ensureInitialAdminUser } = require("../services/initial-admin.service");

module.exports = {
  id: "20260418_0002_seed_admin",
  up: async () => {
    await ensureInitialAdminUser();
  },
};
