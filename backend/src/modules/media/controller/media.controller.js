const mediaService = require("../service/media.service");

const uploadMedia = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.user?._id || null;
    const asset = await mediaService.createUploadedAsset({ file: req.file, userId });
    return res.status(201).json({ item: asset });
  } catch (error) {
    return next(error);
  }
};

const listMedia = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const result = await mediaService.listMedia({
      search,
      page,
      limit,
      role: req.user?.role || "",
      userId: req.user?.userId || null,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

const deleteMedia = async (req, res, next) => {
  try {
    await mediaService.deleteMedia({
      id: req.params.id,
      role: req.user?.role || "",
      userId: req.user?.userId || null,
    });
    return res.status(200).json({ message: "Media deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadMedia,
  listMedia,
  deleteMedia,
};
