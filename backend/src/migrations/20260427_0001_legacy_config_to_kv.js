const Config = require("../models/Config");
const SiteConfigEntry = require("../models/SiteConfigEntry");
const { CONFIG_SECTION_KEYS } = require("../modules/config/domain/config-section-keys");
const siteConfigRepository = require("../modules/config/repository/site-config.repository");

module.exports = {
  id: "20260427_0001_legacy_config_to_kv",
  up: async () => {
    await SiteConfigEntry.syncIndexes();

    const existingKv = await SiteConfigEntry.countDocuments();
    if (existingKv > 0) {
      return;
    }

    const legacy = await Config.findOne().lean();
    if (!legacy) {
      return;
    }

    const payload = {};
    for (const key of CONFIG_SECTION_KEYS) {
      if (legacy[key] !== undefined) {
        payload[key] = legacy[key];
      }
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    await siteConfigRepository.upsertMany(payload);
  },
};
