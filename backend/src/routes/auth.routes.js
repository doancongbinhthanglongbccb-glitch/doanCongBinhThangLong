const express = require("express");
const { login, refresh, logout } = require("../controllers/auth.controller");
const { validateBody } = require("../middleware/validate.middleware");
const { loginSchema, refreshSchema } = require("../validation/auth.validation");

const router = express.Router();

router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.post("/logout", validateBody(refreshSchema), logout);

module.exports = router;
