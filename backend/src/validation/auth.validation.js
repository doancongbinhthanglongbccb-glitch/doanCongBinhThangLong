const { z } = require("zod");

const loginSchema = z
  .object({
    username: z.string().trim().min(1, "Username is required").optional(),
    email: z.string().trim().email("Email must be valid").optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .strict()
  .refine((data) => Boolean(data.username || data.email), {
    message: "Username or email is required",
    path: ["username"],
  });

const refreshSchema = z
  .object({
    refreshToken: z.string().trim().min(1, "Refresh token is required"),
  })
  .strict();

module.exports = {
  loginSchema,
  refreshSchema,
};
