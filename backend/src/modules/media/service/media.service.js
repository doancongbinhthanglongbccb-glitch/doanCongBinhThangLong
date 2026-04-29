const path = require("path");
const { BadRequestError } = require("../../../utils/errors");
const mediaRepository = require("../repository/media.repository");

const buildMediaUrl = (filename) => `/media/${filename}`;

const parseImageDimensions = async (filePath) => {
  try {
    // Lazy-load to avoid cost when not needed.
    // eslint-disable-next-line global-require
    const { imageSize } = require("image-size");
    const dim = imageSize(filePath);
    if (!dim || !dim.width || !dim.height) return { width: null, height: null };
    return { width: dim.width, height: dim.height };
  } catch {
    return { width: null, height: null };
  }
};

const createUploadedAsset = async ({ file, userId }) => {
  if (!file) {
    throw new BadRequestError("File is required", null, "FILE_REQUIRED");
  }

  const { width, height } = await parseImageDimensions(file.path);

  const payload = {
    originalName: file.originalname,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    width,
    height,
    url: buildMediaUrl(file.filename),
    createdBy: userId || null,
  };

  // Safety: multer gives us the filename; make sure we never store a path here.
  if (payload.filename !== path.basename(payload.filename)) {
    throw new BadRequestError("Invalid filename", null, "INVALID_FILENAME");
  }

  return mediaRepository.create(payload);
};

const listMedia = async ({ search = "", page = 1, limit = 20, role, userId }) => {
  const normalizedLimit = Number(limit);
  const safeLimit = Number.isFinite(normalizedLimit) ? Math.min(Math.max(normalizedLimit, 1), 200) : 20;
  const normalizedPage = Math.max(1, Number(page) || 1);
  const q = String(search || "").trim();

  const filter = {};
  if (q) {
    filter.$text = { $search: q };
  }

  // Editors see only their media; admin sees all
  if (role !== "admin") {
    filter.createdBy = userId || null;
  }

  return mediaRepository.listPaginatedLean({ filter, page: normalizedPage, limit: safeLimit });
};

const deleteMedia = async ({ id, role, userId }) => {
  const asset = await mediaRepository.findById(id);
  if (!asset) {
    throw new BadRequestError("Media not found", { id }, "MEDIA_NOT_FOUND");
  }

  const isOwner = userId && String(asset.createdBy?._id || asset.createdBy) === String(userId);
  const isAdmin = role === "admin";
  if (!isAdmin && !isOwner) {
    throw new BadRequestError("Not allowed to delete this media", null, "MEDIA_DELETE_FORBIDDEN");
  }

  await mediaRepository.deleteById(id);
  return true;
};

module.exports = {
  createUploadedAsset,
  listMedia,
  deleteMedia,
};
