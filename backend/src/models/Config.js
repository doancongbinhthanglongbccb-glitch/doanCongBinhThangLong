const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    home: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    header: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    navItems: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    menu: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    hero: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    intro: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    guongBac: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    thuVien: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    binhDanHocVu: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    sidebarImages: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    footer: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    chatbot: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Config", configSchema);
