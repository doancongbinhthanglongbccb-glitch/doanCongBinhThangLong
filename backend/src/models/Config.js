const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    header: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    menu: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    footer: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Config", configSchema);
