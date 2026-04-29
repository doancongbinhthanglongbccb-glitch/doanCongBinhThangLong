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
    /**
     * CMS workflow state (kept alongside legacy `status` for backward compatibility).
     * Public APIs still rely on `status === "published"` for visibility.
     */
    workflowStatus: {
      type: String,
      enum: ["draft", "pending", "approved", "published", "rejected", "archived"],
      default: "draft",
      index: true,
    },
    review: {
      submittedAt: { type: Date, default: null },
      submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      reviewedAt: { type: Date, default: null },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      decisionNote: { type: String, default: "", trim: true, maxlength: 2000 },
    },
    revision: {
      current: { type: Number, default: 0, min: 0 },
      lastPublished: { type: Number, default: 0, min: 0 },
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
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ title: "text", slug: "text", content: "text" });
postSchema.index({ status: 1 });
postSchema.index({ workflowStatus: 1 });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ status: 1, author: 1, createdAt: -1 });
postSchema.index({ status: 1, categoryIds: 1, createdAt: -1 });
postSchema.index({ workflowStatus: 1, author: 1, updatedAt: -1 });

module.exports = mongoose.model("Post", postSchema);
