const mongoose = require("mongoose");

/**
 * Immutable post revision snapshots.
 *
 * - One Post is the "current" state.
 * - Each meaningful change creates a PostRevision with incrementing `version`.
 * - Snapshot is kept intentionally explicit (avoid Mixed) so future migrations
 *   can reason about shape.
 */
const postRevisionSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      min: 1,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: ["create", "edit", "submit", "approve", "reject", "publish", "unpublish", "archive", "restore"],
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    snapshot: {
      title: { type: String, required: true },
      slug: { type: String, required: true },
      content: { type: String, required: true },
      thumbnail: { type: String, default: "" },
      categoryIds: { type: [mongoose.Schema.Types.ObjectId], ref: "Category", default: [] },
      excerpt: { type: String, default: "" },
      seoTitle: { type: String, default: "" },
      seoDescription: { type: String, default: "" },
      status: { type: String, enum: ["draft", "published", "archived"], required: true },
      workflowStatus: {
        type: String,
        enum: ["draft", "pending", "approved", "published", "rejected", "archived"],
        required: true,
      },
      publishedAt: { type: Date, default: null },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: false }
);

postRevisionSchema.index({ postId: 1, version: -1 }, { unique: true });

module.exports = mongoose.model("PostRevision", postRevisionSchema);

