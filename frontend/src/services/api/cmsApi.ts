import type { CmsCollectionKey, CmsData } from "@/shared/types/cms";
import { clone, getCmsStore, updateCmsStore } from "./store/cmsStore";

export const getCmsData = async (): Promise<CmsData> => {
  return getCmsStore();
};

export const updateCmsData = async (
  updater: CmsData | ((previous: CmsData) => CmsData),
): Promise<CmsData> => {
  return updateCmsStore(updater);
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
