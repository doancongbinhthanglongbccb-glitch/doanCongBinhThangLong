import type { CmsCollectionKey, CmsData } from "@/shared/types/cms";
import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "./endpoints";

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

const normalizeCmsData = (payload?: Partial<CmsData> & { menu?: CmsData["navItems"] }): CmsData => {
  if (!payload) {
    return clone(defaultCmsData);
  }

  const navItems = payload.navItems || payload.menu || [];

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

export const getCmsData = async (): Promise<CmsData> => {
  const { data } = await axiosClient.get(ApiEndpoints.config);
  return normalizeCmsData(data);
};

export const updateCmsData = async (
  updater: CmsData | ((previous: CmsData) => CmsData),
): Promise<CmsData> => {
  const previous = await getCmsData();
  const next = typeof updater === "function" ? updater(previous) : updater;

  const { data } = await axiosClient.put(ApiEndpoints.config, toConfigPayload(next));
  return normalizeCmsData(data);
};

export const createCollectionItem = async <K extends CmsCollectionKey>(
  collection: K,
  payload: Omit<CmsData[K][number], "id">,
): Promise<CmsData[K][number]> => {
  const id = `${collection}-${Date.now()}`;
  const nextItem = { ...payload, id } as CmsData[K][number];

  await updateCmsData((previous) => ({
    ...previous,
    [collection]: [nextItem, ...previous[collection]],
  }));

  return clone(nextItem);
};

export const updateCollectionItem = async <K extends CmsCollectionKey>(
  collection: K,
  id: string,
  payload: Partial<Omit<CmsData[K][number], "id">>,
): Promise<CmsData[K][number] | null> => {
  let updatedItem: CmsData[K][number] | null = null;

  await updateCmsData((previous) => ({
    ...previous,
    [collection]: previous[collection].map((item) => {
      if (item.id !== id) {
        return item;
      }

      updatedItem = { ...item, ...payload } as CmsData[K][number];
      return updatedItem;
    }),
  }));

  return updatedItem ? clone(updatedItem) : null;
};

export const deleteCollectionItem = async <K extends CmsCollectionKey>(
  collection: K,
  id: string,
): Promise<boolean> => {
  let removed = false;

  await updateCmsData((previous) => ({
    ...previous,
    [collection]: previous[collection].filter((item) => {
      if (item.id === id) {
        removed = true;
        return false;
      }
      return true;
    }),
  }));

  return removed;
};
