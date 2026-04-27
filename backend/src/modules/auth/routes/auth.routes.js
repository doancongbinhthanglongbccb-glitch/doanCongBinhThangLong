const express = require("express");
const { login, refresh, logout } = require("../controller/auth.controller");
const { authLoginRateLimiter } = require("../../../middleware/auth-rate-limit.middleware");
const { validateBody } = require("../../../middleware/validate.middleware");
const { loginSchema } = require("../../../validation/auth.validation");

const router = express.Router();

router.post("/login", authLoginRateLimiter, validateBody(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
