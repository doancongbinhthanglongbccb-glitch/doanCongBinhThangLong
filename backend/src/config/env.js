const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config();

const booleanString = z
  .union([z.boolean(), z.string()])
  .transform((value) => value === true || value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  MONGO_URI: z.string().trim().default(""),
  ADMIN_USERNAME: z.string().trim().default(""),
  ADMIN_PASSWORD: z.string().trim().default(""),
  JWT_SECRET: z.string().trim().default(""),
  JWT_REFRESH_SECRET: z.string().trim().default(""),
  ACCESS_TOKEN_EXPIRE: z.string().trim().default("15m"),
  REFRESH_TOKEN_EXPIRE: z.string().trim().default("7d"),
  COOKIE_SECURE: booleanString.default(false),
  COOKIE_SAME_SITE: z.enum(["strict", "lax", "none"]).default("lax"),
  COOKIE_DOMAIN: z.string().trim().optional().or(z.literal("")),
  CORS_ORIGIN: z.string().trim().default(""),
  REQUEST_BODY_LIMIT: z.string().trim().default("10mb"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(200),
  LOG_LEVEL: z.string().trim().default("info"),
  SENTRY_DSN: z.string().trim().optional().or(z.literal("")),
  SENTRY_ENVIRONMENT: z.string().trim().optional().or(z.literal("")),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  SWAGGER_ENABLED: booleanString.optional(),
});

const parsedEnv = envSchema.parse(process.env);
const env = {
  ...parsedEnv,
  SWAGGER_ENABLED:
    parsedEnv.SWAGGER_ENABLED !== undefined
      ? parsedEnv.SWAGGER_ENABLED
      : parsedEnv.NODE_ENV !== "production",
};

const isPlaceholderValue = (value) =>
  typeof value === "string" && /replace_with|change_me|<[^>]+>/i.test(value);

const WEAK_SECRET_VALUES = new Set(["123456", "secret", "password", "changeme"]);

const isWeakSecretValue = (value) => {
  if (typeof value !== "string") {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return !normalized || WEAK_SECRET_VALUES.has(normalized) || isPlaceholderValue(normalized);
};

const assertRuntimeEnv = (runtimeEnv) => {
  const missing = [];
  const invalid = [];

  if (!runtimeEnv.MONGO_URI) {
    missing.push("MONGO_URI");
  } else if (isPlaceholderValue(runtimeEnv.MONGO_URI)) {
    invalid.push("MONGO_URI");
  }

  if (!runtimeEnv.ADMIN_USERNAME || isPlaceholderValue(runtimeEnv.ADMIN_USERNAME)) {
    missing.push("ADMIN_USERNAME");
  }

  if (!runtimeEnv.ADMIN_PASSWORD) {
    missing.push("ADMIN_PASSWORD");
  } else if (isWeakSecretValue(runtimeEnv.ADMIN_PASSWORD)) {
    invalid.push("ADMIN_PASSWORD");
  }

  if (!runtimeEnv.JWT_SECRET) {
    missing.push("JWT_SECRET");
  } else if (isWeakSecretValue(runtimeEnv.JWT_SECRET)) {
    invalid.push("JWT_SECRET");
  }

  if (!runtimeEnv.JWT_REFRESH_SECRET) {
    missing.push("JWT_REFRESH_SECRET");
  } else if (isWeakSecretValue(runtimeEnv.JWT_REFRESH_SECRET)) {
    invalid.push("JWT_REFRESH_SECRET");
  }

  if (runtimeEnv.NODE_ENV === "production" && !runtimeEnv.CORS_ORIGIN) {
    missing.push("CORS_ORIGIN");
  }

  if (runtimeEnv.NODE_ENV === "production" && runtimeEnv.COOKIE_SECURE !== true) {
    throw new Error("COOKIE_SECURE must be true in production");
  }

  if (runtimeEnv.COOKIE_SAME_SITE === "none" && runtimeEnv.COOKIE_SECURE !== true) {
    throw new Error("COOKIE_SECURE must be true when COOKIE_SAME_SITE is none");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (invalid.length > 0) {
    throw new Error(`Invalid or weak environment values: ${invalid.join(", ")}`);
  }
};

module.exports = {
  env,
  assertRuntimeEnv,
};