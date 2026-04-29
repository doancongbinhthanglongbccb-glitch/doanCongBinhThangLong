const { z } = require("zod");

const titleSchema = z.string().trim().min(10, "Title must be at least 10 characters");
const contentSchema = z.string().trim().min(50, "Content must be at least 50 characters");
const slugSchema = z.string().trim().min(1, "Slug is required").max(200, "Slug is too long");

const createPostSchema = z
  .object({
    title: titleSchema,
    slug: slugSchema.optional(),
    content: contentSchema,
    thumbnail: z.string().trim().max(2048, "Thumbnail is too long").optional(),
    status: z.enum(["draft", "published"]).optional(),
    categoryIds: z.array(z.string().trim().min(1)).optional(),
    excerpt: z.string().trim().max(500).optional(),
    seoTitle: z.string().trim().max(200).optional(),
    seoDescription: z.string().trim().max(500).optional(),
  })
  .strict();

const updatePostSchema = z
  .object({
    title: titleSchema.optional(),
    slug: slugSchema.optional(),
    content: contentSchema.optional(),
    thumbnail: z.string().trim().max(2048, "Thumbnail is too long").optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    categoryIds: z.array(z.string().trim().min(1)).optional(),
    excerpt: z.string().trim().max(500).optional(),
    seoTitle: z.string().trim().max(200).optional(),
    seoDescription: z.string().trim().max(500).optional(),
  })
  .strict()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required for update",
    path: ["body"],
  });

module.exports = {
  createPostSchema,
  updatePostSchema,
  rejectPostSchema: z
    .object({
      note: z.string().trim().min(1, "Rejection note is required").max(2000, "Note is too long"),
    })
    .strict(),
};
