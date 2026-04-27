const configService = require("../service/config.service");
const asyncHandler = require("../../../utils/asyncHandler");

const getConfig = asyncHandler(async (req, res) => {
  const config = await configService.getConfig();
  return res.status(200).json(config);
});

const getConfigKeyList = asyncHandler(async (req, res) => {
  const keys = await configService.listConfigKeys();
  return res.status(200).json({ keys });
});

const getConfigEntryByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const entry = await configService.getConfigEntry(key);
  return res.status(200).json(entry);
});

const updateConfig = asyncHandler(async (req, res) => {
  const updatedConfig = await configService.updateConfig(req.body);
  return res.status(200).json(updatedConfig);
});

module.exports = {
  getConfig,
  getConfigKeyList,
  getConfigEntryByKey,
  updateConfig,
};
