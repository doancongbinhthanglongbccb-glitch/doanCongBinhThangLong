const { z } = require("zod");

const nameSchema = z.string().trim().min(1).max(200);
const slugSchema = z.string().trim().min(1).max(200);

const createCategorySchema = z
  .object({
    name: nameSchema,
    slug: slugSchema.optional(),
    parentId: z.string().trim().optional().nullable(),
    order: z.number().int().min(0).optional(),
    visible: z.boolean().optional(),
    description: z.string().trim().max(2000).optional(),
  })
  .strict();

const updateCategorySchema = z
  .object({
    name: nameSchema.optional(),
    slug: slugSchema.optional(),
    parentId: z.string().trim().optional().nullable(),
    order: z.number().int().min(0).optional(),
    visible: z.boolean().optional(),
    description: z.string().trim().max(2000).optional(),
  })
  .strict()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field is required for update",
    path: ["body"],
  });

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
