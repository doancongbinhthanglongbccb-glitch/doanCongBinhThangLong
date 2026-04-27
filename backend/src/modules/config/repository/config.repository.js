const Config = require("../../../models/Config");

const findOneLean = () => Config.findOne().lean();

const findOne = () => Config.findOne();

const upsertNormalized = (normalized) => {
  return Config.findOneAndUpdate({}, normalized, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });
};

module.exports = {
  findOneLean,
  findOne,
  upsertNormalized,
};
