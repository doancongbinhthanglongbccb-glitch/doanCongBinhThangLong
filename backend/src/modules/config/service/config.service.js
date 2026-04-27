const { BadRequestError } = require("../../../utils/errors");
const { defaultConfig } = require("../domain/default-config");
const { CONFIG_SECTION_KEYS } = require("../domain/config-section-keys");
const configRepository = require("../repository/config.repository");
const siteConfigRepository = require("../repository/site-config.repository");

const mergeObjectSection = (baseValue, nextValue) => {
  if (nextValue === undefined) {
    return baseValue;
  }

  if (!nextValue || typeof nextValue !== "object" || Array.isArray(nextValue)) {
    return nextValue;
  }

  return {
    ...(baseValue || {}),
    ...nextValue,
  };
};

const normalizeMenuAliases = (config) => {
  return {
    ...defaultConfig,
    ...config,
    navItems: config.navItems || config.menu || [],
    menu: config.menu || config.navItems || [],
  };
};

/**
 * @param {Array<{ key: string, value: unknown }>} entries
 */
const entriesToPlainObject = (entries) => {
  const o = {};
  for (const { key, value } of entries) {
    o[key] = value;
  }
  return o;
};

/**
 * Merge KVS partials onto defaults (same rules as monolithic document load).
 * @param {Record<string, unknown>} kvs
 */
const mergeKvsWithDefaults = (kvs) => {
  const next = { ...defaultConfig };

  for (const key of CONFIG_SECTION_KEYS) {
    if (kvs[key] === undefined) {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (key === "navItems" || key === "menu") {
      next[key] = kvs[key];
    } else if (Array.isArray(kvs[key])) {
      next[key] = kvs[key];
    } else {
      next[key] = mergeObjectSection(defaultConfig[key], kvs[key]);
    }
  }

  return normalizeMenuAliases(next);
};

const hasKvData = (entries) => Array.isArray(entries) && entries.length > 0;

const getConfig = async () => {
  const entries = await siteConfigRepository.findAllLean();

  if (hasKvData(entries)) {
    return mergeKvsWithDefaults(entriesToPlainObject(entries));
  }

  const legacy = await configRepository.findOneLean();
  if (!legacy) {
    return defaultConfig;
  }

  return normalizeMenuAliases(legacy);
};

/**
 * @param {Record<string, unknown>} normalized
 */
const pickSectionPayloadForKvs = (normalized) => {
  const payload = {};
  for (const key of CONFIG_SECTION_KEYS) {
    if (Object.prototype.hasOwnProperty.call(normalized, key)) {
      payload[key] = normalized[key];
    }
  }
  return payload;
};

const updateConfig = async (payload) => {
  if (!payload || Object.keys(payload).length === 0) {
    throw new BadRequestError("No config fields provided");
  }

  const current = await configRepository.findOne();
  const currentConfig = current ? current.toObject() : await getConfig();

  const nextConfig = {
    ...currentConfig,
    ...payload,
    home: mergeObjectSection(currentConfig.home, payload.home),
    header: mergeObjectSection(currentConfig.header, payload.header),
    hero: mergeObjectSection(currentConfig.hero, payload.hero),
    intro: mergeObjectSection(currentConfig.intro, payload.intro),
    sidebarImages: mergeObjectSection(currentConfig.sidebarImages, payload.sidebarImages),
    footer: mergeObjectSection(currentConfig.footer, payload.footer),
    chatbot: mergeObjectSection(currentConfig.chatbot, payload.chatbot),
  };

  if (payload.navItems !== undefined) {
    nextConfig.menu = payload.navItems;
  }

  if (payload.menu !== undefined && payload.navItems === undefined) {
    nextConfig.navItems = payload.menu;
  }

  const normalized = normalizeMenuAliases(nextConfig);

  const kvsPayload = pickSectionPayloadForKvs(normalized);
  await siteConfigRepository.upsertMany(kvsPayload);

  const saved = await configRepository.upsertNormalized(normalized);
  return normalizeMenuAliases(saved.toObject());
};

const listConfigKeys = async () => {
  const entries = await siteConfigRepository.findAllLean();
  if (hasKvData(entries)) {
    return entries.map((e) => e.key).sort();
  }
  const legacy = await configRepository.findOneLean();
  if (legacy) {
    return CONFIG_SECTION_KEYS.filter((k) => legacy[k] !== undefined);
  }
  return [];
};

const getConfigEntry = async (key) => {
  if (!key || !CONFIG_SECTION_KEYS.includes(key)) {
    throw new BadRequestError("Unknown or invalid config key", { key });
  }

  const entries = await siteConfigRepository.findAllLean();
  if (hasKvData(entries)) {
    const hit = entries.find((e) => e.key === key);
    if (hit) {
      return { key, value: hit.value };
    }
  }

  const full = await getConfig();
  return { key, value: full[key] };
};

module.exports = {
  getConfig,
  updateConfig,
  listConfigKeys,
  getConfigEntry,
  CONFIG_SECTION_KEYS,
};
