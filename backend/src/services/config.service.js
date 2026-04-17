const Config = require("../models/Config");
const { BadRequestError } = require("../utils/errors");

const getConfig = async () => {
  const config = await Config.findOne().lean();

  if (!config) {
    return {
      header: {},
      menu: [],
      footer: {},
    };
  }

  return config;
};

const updateConfig = async (payload) => {
  const nextPayload = {};

  if (payload?.header !== undefined) {
    nextPayload.header = payload.header;
  }

  if (payload?.menu !== undefined) {
    nextPayload.menu = payload.menu;
  }

  if (payload?.footer !== undefined) {
    nextPayload.footer = payload.footer;
  }

  if (Object.keys(nextPayload).length === 0) {
    throw new BadRequestError("No config fields provided");
  }

  return Config.findOneAndUpdate({}, nextPayload, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });
};

module.exports = {
  getConfig,
  updateConfig,
};
