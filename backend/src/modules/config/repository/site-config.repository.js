const SiteConfigEntry = require("../../../models/SiteConfigEntry");

const findAllLean = () => SiteConfigEntry.find().lean().sort({ key: 1 });

const findByKeyLean = (key) => SiteConfigEntry.findOne({ key }).lean();

const upsertValue = (key, value) =>
  SiteConfigEntry.findOneAndUpdate(
    { key },
    { $set: { value } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

/**
 * @param {Record<string, unknown>} keyToValue
 */
const upsertMany = async (keyToValue) => {
  const keys = Object.keys(keyToValue);
  const out = [];
  for (const key of keys) {
    // eslint-disable-next-line no-await-in-loop
    const doc = await upsertValue(key, keyToValue[key]);
    out.push(doc);
  }
  return out;
};

module.exports = {
  findAllLean,
  findByKeyLean,
  upsertValue,
  upsertMany,
};
