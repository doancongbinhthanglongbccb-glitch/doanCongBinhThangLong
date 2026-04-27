import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "@/services/api/endpoints";
import type { CmsData, ConfigUpdatePayload } from "../types/config.types";

const clone = <T,>(value: T): T => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
};

const defaultCmsData: CmsData = {
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
  hero: {
    image: "",
    title: "",
    subtitle: "",
  },
  intro: {
    title: "Giới thiệu",
    content: "",
  },
  activities: [],
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

const normalizeCmsData = (
  payload?: Partial<CmsData> & { menu?: CmsData["navItems"] }
): CmsData => {
  if (!payload) {
    return clone(defaultCmsData);
  }

  const navItems = payload.navItems || (payload.menu as any) || [];

  return {
    ...clone(defaultCmsData),
    ...payload,
    navItems,
    activities: payload.activities || [],
    guongBac: payload.guongBac || [],
    thuVien: payload.thuVien || [],
    binhDanHocVu: payload.binhDanHocVu || [],
  };
};

const toConfigPayload = (data: CmsData) => ({
  home: data.home,
  header: data.header,
  navItems: data.navItems,
  menu: data.navItems,
  hero: data.hero,
  intro: data.intro,
  guongBac: data.guongBac,
  thuVien: data.thuVien,
  binhDanHocVu: data.binhDanHocVu,
  sidebarImages: data.sidebarImages,
  footer: data.footer,
  chatbot: data.chatbot,
});

export const getConfig = async (): Promise<CmsData> => {
  const { data } = await axiosClient.get(ApiEndpoints.config);
  return normalizeCmsData(data);
};

export const updateConfig = async (
  updater: ConfigUpdatePayload | ((previous: CmsData) => ConfigUpdatePayload)
): Promise<CmsData> => {
  const current = await getConfig();
  const nextData = typeof updater === "function" ? updater(current) : updater;
  const payload = toConfigPayload({ ...current, ...nextData });

  const { data } = await axiosClient.put(ApiEndpoints.config, payload);
  return normalizeCmsData(data);
};
