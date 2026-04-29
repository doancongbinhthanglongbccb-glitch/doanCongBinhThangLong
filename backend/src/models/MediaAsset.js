const mongoose = require("mongoose");

const mediaAssetSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true, trim: true },
    filename: { type: String, required: true, trim: true, unique: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    url: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  },
  { timestamps: true }
);

mediaAssetSchema.index({ filename: 1 });
mediaAssetSchema.index({ originalName: "text", filename: "text" });
mediaAssetSchema.index({ createdAt: -1 });

module.exports = mongoose.model("MediaAsset", mediaAssetSchema);
