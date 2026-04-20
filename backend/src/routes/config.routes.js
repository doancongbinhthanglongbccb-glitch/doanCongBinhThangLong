const express = require("express");
const { getConfig, updateConfig } = require("../controllers/config.controller");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const { validateBody } = require("../middleware/validate.middleware");
const { configUpdateSchema } = require("../validation/config.validation");

const router = express.Router();

router.get("/", getConfig);
router.put("/", authMiddleware, requireRole(["admin"]), validateBody(configUpdateSchema), updateConfig);

module.exports = router;
