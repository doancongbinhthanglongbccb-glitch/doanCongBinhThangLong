const mediaService = require("../service/media.service");

const uploadMedia = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || null;
    const asset = await mediaService.createUploadedAsset({ file: req.file, userId });
    return res.status(201).json({ item: asset });
  } catch (error) {
    return next(error);
  }
};

const listMedia = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const result = await mediaService.listLatest({ limit });
    return res.json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadMedia,
  listMedia,
};
