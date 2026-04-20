import { z } from "zod";

const optionalUrl = z
  .union([z.string().url(), z.literal("")])
  .optional()
  .default("");

const envSchema = z.object({
  VITE_API_URL: z.string().trim().default(""),
  VITE_API_BASE_URL: z.string().trim().default(""),
  VITE_SENTRY_DSN: optionalUrl,
  VITE_SENTRY_ENVIRONMENT: z.string().trim().optional().default(""),
  VITE_SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
});

export const env = envSchema.parse(import.meta.env);