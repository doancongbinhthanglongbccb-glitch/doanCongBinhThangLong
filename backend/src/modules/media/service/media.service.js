const path = require("path");
const { BadRequestError } = require("../../../utils/errors");
const mediaRepository = require("../repository/media.repository");

const buildMediaUrl = (filename) => `/media/${filename}`;

const createUploadedAsset = async ({ file, userId }) => {
  if (!file) {
    throw new BadRequestError("File is required", null, "FILE_REQUIRED");
  }

  const payload = {
    originalName: file.originalname,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    url: buildMediaUrl(file.filename),
    createdBy: userId || null,
  };

  // Safety: multer gives us the filename; make sure we never store a path here.
  if (payload.filename !== path.basename(payload.filename)) {
    throw new BadRequestError("Invalid filename", null, "INVALID_FILENAME");
  }

  return mediaRepository.create(payload);
};

const listLatest = async ({ limit = 40 } = {}) => {
  const normalizedLimit = Number(limit);
  const safeLimit = Number.isFinite(normalizedLimit) ? Math.min(Math.max(normalizedLimit, 1), 200) : 40;
  const items = await mediaRepository.listLatestLean({ limit: safeLimit });

  return { items };
};

module.exports = {
  createUploadedAsset,
  listLatest,
};
