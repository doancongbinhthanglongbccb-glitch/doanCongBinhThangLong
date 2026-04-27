const mongoose = require("mongoose");

/**
 * Key-value store for site configuration. Each document holds one top-level
 * section (e.g. "home", "footer") to replace the monolithic Config document
 * over time while keeping GET /api/config response shape stable.
 */
const siteConfigEntrySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 64,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SiteConfigEntry", siteConfigEntrySchema);
