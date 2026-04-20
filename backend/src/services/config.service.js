const Config = require("../models/Config");
const { BadRequestError } = require("../utils/errors");

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

const defaultConfig = {
  home: {
    mainFeedTitle: "Hoạt động tin",
    mainFeedDescription: "",
    guongBacTitle: "Theo gương Bác",
    thuVienTitle: "Thư viện",
  },
  header: {
    logo: "",
    title: "",
    subtitle: "",
  },
  navItems: [],
  menu: [],
  hero: {
    image: "",
    title: "",
    subtitle: "",
  },
  intro: {
    title: "Giới thiệu",
    content: "",
  },
  guongBac: [],
  thuVien: [],
  binhDanHocVu: [],
  sidebarImages: {
    topImage: "",
    bottomImage: "",
  },
  footer: {
    title: "",
    descriptionLines: [],
    quickLinks: [],
    contactLines: [],
    copyright: "",
  },
  chatbot: {
    title: "",
    subtitle: "",
    welcomeMessage: "",
    greetingResponse: "",
    fallbackResponse: "",
    knowledgeBase: {},
  },
};

const getConfig = async () => {
  const config = await Config.findOne().lean();

  if (!config) {
    return defaultConfig;
  }

  return {
    ...defaultConfig,
    ...config,
    navItems: config.navItems || config.menu || [],
    menu: config.menu || config.navItems || [],
  };
};

const updateConfig = async (payload) => {
  if (!payload || Object.keys(payload).length === 0) {
    throw new BadRequestError("No config fields provided");
  }

  const current = await Config.findOne();
  const currentConfig = current ? current.toObject() : defaultConfig;

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

  const normalized = {
    ...defaultConfig,
    ...nextConfig,
    navItems: nextConfig.navItems || nextConfig.menu || [],
    menu: nextConfig.menu || nextConfig.navItems || [],
  };

  const saved = await Config.findOneAndUpdate({}, normalized, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  return {
    ...defaultConfig,
    ...saved.toObject(),
    navItems: saved.navItems || saved.menu || [],
    menu: saved.menu || saved.navItems || [],
  };
};

module.exports = {
  getConfig,
  updateConfig,
};
