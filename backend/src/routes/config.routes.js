const express = require("express");
const { getConfig, updateConfig } = require("../controllers/config.controller");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", getConfig);
router.put("/", authMiddleware, requireRole(["admin"]), updateConfig);

module.exports = router;
