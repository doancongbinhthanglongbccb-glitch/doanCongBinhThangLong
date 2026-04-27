const mongoose = require("mongoose");

const mediaAssetSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true, trim: true },
    filename: { type: String, required: true, trim: true, unique: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    url: { type: String, required: true, trim: true },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MediaAsset", mediaAssetSchema);
