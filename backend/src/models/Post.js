const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
      trim: true,
    },
    categoryIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
      default: [],
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    seoTitle: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },
    seoDescription: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ title: "text", slug: "text", content: "text" });
postSchema.index({ status: 1 });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ status: 1, author: 1, createdAt: -1 });
postSchema.index({ status: 1, categoryIds: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
