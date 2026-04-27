const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const authMiddleware = require("../../../middleware/auth.middleware");
const requireRole = require("../../../middleware/role.middleware");
const { UserRole } = require("../../../domain/roles");
const { uploadMedia, listMedia } = require("../controller/media.controller");
const { BadRequestError } = require("../../../utils/errors");

const router = express.Router();

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 12 ? ext : "";
    const name = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${name}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file?.mimetype?.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new BadRequestError("Only image uploads are supported", { mimeType: file?.mimetype }, "UNSUPPORTED_MEDIA_TYPE"));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// Admin/CMS
router.get("/", authMiddleware, requireRole(UserRole.EDITOR), listMedia);
router.post("/upload", authMiddleware, requireRole(UserRole.EDITOR), upload.single("file"), uploadMedia);

module.exports = router;
