const express = require("express");
const {
  getConfig,
  getConfigKeyList,
  getConfigEntryByKey,
  updateConfig,
} = require("../controller/config.controller");
const authMiddleware = require("../../../middleware/auth.middleware");
const requireRole = require("../../../middleware/role.middleware");
const { validateBody } = require("../../../middleware/validate.middleware");
const { configUpdateSchema } = require("../../../validation/config.validation");
const { UserRole } = require("../../../domain/roles");

const router = express.Router();

router.get("/keys", getConfigKeyList);
router.get("/entries/:key", getConfigEntryByKey);
router.get("/", getConfig);
router.put("/", authMiddleware, requireRole(UserRole.ADMIN), validateBody(configUpdateSchema), updateConfig);

module.exports = router;
