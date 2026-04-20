const { z } = require("zod");

const navChildItemSchema = z
  .object({
    id: z.string().trim().optional(),
    label: z.string().trim().min(1).optional(),
    href: z.string().trim().min(1).optional(),
    visible: z.boolean().optional(),
  })
  .strict();

const navItemSchema = z
  .object({
    id: z.string().trim().optional(),
    label: z.string().trim().min(1).optional(),
    href: z.string().trim().optional(),
    active: z.boolean().optional(),
    visible: z.boolean().optional(),
    children: z.array(navChildItemSchema).optional(),
  })
  .strict();

const homeSchema = z
  .object({
    mainFeedTitle: z.string().trim().min(1).optional(),
    mainFeedDescription: z.string().trim().optional(),
    guongBacTitle: z.string().trim().min(1).optional(),
    thuVienTitle: z.string().trim().min(1).optional(),
  })
  .strict();

const headerSchema = z
  .object({
    logo: z.string().trim().optional(),
    title: z.string().trim().optional(),
    subtitle: z.string().trim().optional(),
  })
  .strict();

const heroSchema = z
  .object({
    image: z.string().trim().optional(),
    title: z.string().trim().optional(),
    subtitle: z.string().trim().optional(),
  })
  .strict();

const introSchema = z
  .object({
    title: z.string().trim().optional(),
    content: z.string().trim().optional(),
  })
  .strict();

const guongBacItemSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(1).optional(),
    content: z.string().trim().optional(),
    type: z.string().trim().min(1).optional(),
    date: z.string().trim().optional(),
  })
  .strict();

const thuVienItemSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(1).optional(),
    type: z.string().trim().min(1).optional(),
    url: z.string().trim().url().optional(),
    date: z.string().trim().optional(),
  })
  .strict();

const binhDanHocVuItemSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(1).optional(),
    link: z.string().trim().optional(),
    summary: z.string().trim().optional(),
    image: z.string().trim().optional(),
  })
  .strict();

const sidebarImagesSchema = z
  .object({
    topImage: z.string().trim().optional(),
    bottomImage: z.string().trim().optional(),
  })
  .strict();

const footerSchema = z
  .object({
    title: z.string().trim().optional(),
    descriptionLines: z.array(z.string().trim()).optional(),
    quickLinks: z
      .array(
        z
          .object({
            label: z.string().trim().min(1),
            href: z.string().trim().min(1),
          })
          .strict(),
      )
      .optional(),
    contactLines: z.array(z.string().trim()).optional(),
    copyright: z.string().trim().optional(),
  })
  .strict();

const chatbotSchema = z
  .object({
    title: z.string().trim().optional(),
    subtitle: z.string().trim().optional(),
    welcomeMessage: z.string().trim().optional(),
    greetingResponse: z.string().trim().optional(),
    fallbackResponse: z.string().trim().optional(),
    knowledgeBase: z.record(z.string().trim()).optional(),
  })
  .strict();

const configUpdateSchema = z
  .object({
    home: homeSchema.optional(),
    header: headerSchema.optional(),
    navItems: z.array(navItemSchema).optional(),
    menu: z.array(navItemSchema).optional(),
    hero: heroSchema.optional(),
    intro: introSchema.optional(),
    guongBac: z.array(guongBacItemSchema).optional(),
    thuVien: z.array(thuVienItemSchema).optional(),
    binhDanHocVu: z.array(binhDanHocVuItemSchema).optional(),
    sidebarImages: sidebarImagesSchema.optional(),
    footer: footerSchema.optional(),
    chatbot: chatbotSchema.optional(),
  })
  .strict()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one config section is required",
    path: ["body"],
  });

module.exports = {
  configUpdateSchema,
};
