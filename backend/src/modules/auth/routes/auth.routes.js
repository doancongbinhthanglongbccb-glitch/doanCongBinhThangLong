const express = require("express");
const { login, googleLogin, refresh, logout, sessionHint } = require("../controller/auth.controller");
const { authLoginRateLimiter } = require("../../../middleware/auth-rate-limit.middleware");
const { validateBody } = require("../../../middleware/validate.middleware");
const { loginSchema, googleLoginSchema } = require("../../../validation/auth.validation");

const router = express.Router();

router.get("/session", sessionHint);
router.post("/login", authLoginRateLimiter, validateBody(loginSchema), login);
router.post("/google", authLoginRateLimiter, validateBody(googleLoginSchema), googleLogin);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
