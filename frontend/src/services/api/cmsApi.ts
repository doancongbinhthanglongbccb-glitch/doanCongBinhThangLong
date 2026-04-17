import type { CmsCollectionKey, CmsData } from "@/shared/types/cms";
import { clone, getCmsStore, updateCmsStore } from "./store/cmsStore";
import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "./endpoints";

type RemoteConfig = {
  header?: CmsData["header"];
  menu?: CmsData["navItems"];
  footer?: CmsData["footer"];
};

const isNonEmptyObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;

const isNonEmptyArray = <T,>(value: unknown): value is T[] => Array.isArray(value) && value.length > 0;

const mergeRemoteConfig = (base: CmsData, remote?: RemoteConfig): CmsData => {
  if (!remote) {
    return base;
  }

  return {
    ...base,
    header: isNonEmptyObject(remote.header) ? { ...base.header, ...remote.header } : base.header,
    navItems: isNonEmptyArray<CmsData["navItems"][number]>(remote.menu) ? remote.menu : base.navItems,
    footer: isNonEmptyObject(remote.footer) ? { ...base.footer, ...remote.footer } : base.footer,
  };
};

export const getCmsData = async (): Promise<CmsData> => {
  const localData = await getCmsStore();

  try {
    const { data } = await axiosClient.get<RemoteConfig>(ApiEndpoints.config);
    const merged = mergeRemoteConfig(localData, data);
    await updateCmsStore(merged);
    return merged;
  } catch {
    return localData;
  }
};

export const updateCmsData = async (
  updater: CmsData | ((previous: CmsData) => CmsData),
): Promise<CmsData> => {
  const next = await updateCmsStore(updater);

  await axiosClient.put(ApiEndpoints.config, {
    header: next.header,
    menu: next.navItems,
    footer: next.footer,
  });

  return next;
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
