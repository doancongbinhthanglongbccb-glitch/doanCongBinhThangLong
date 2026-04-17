const configService = require("../services/config.service");
const asyncHandler = require("../utils/asyncHandler");

const getConfig = asyncHandler(async (req, res) => {
  const config = await configService.getConfig();
  return res.status(200).json(config);
});

const updateConfig = asyncHandler(async (req, res) => {
  const updatedConfig = await configService.updateConfig(req.body);
  return res.status(200).json(updatedConfig);
});

module.exports = {
  getConfig,
  updateConfig,
};
