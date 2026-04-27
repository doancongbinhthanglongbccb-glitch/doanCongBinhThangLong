import type { CmsCollectionKey, CmsData } from "@/shared/types/cms";
import { getConfig, updateConfig } from "@/features/config/services/config.service";

// Keep legacy `cmsApi` surface, but source config from the `features/config` module.
export const getCmsData = async (): Promise<CmsData> => getConfig();

export const updateCmsData = async (updater: CmsData | ((previous: CmsData) => CmsData)): Promise<CmsData> => {
  // `features/config` update API expects a patch; convert full-updater into a patch.
  return updateConfig((previous) => {
    const next = typeof updater === "function" ? updater(previous as any) : updater;
    return next as any;
  }) as unknown as Promise<CmsData>;
};

// Collection helpers: implemented via update round-trip to avoid hardcoded defaults.
export const createCollectionItem = async <K extends CmsCollectionKey>(
  collection: K,
  payload: Omit<CmsData[K][number], "id">,
): Promise<CmsData[K][number]> => {
  const id = `${collection}-${Date.now()}`;
  const nextItem = { ...payload, id } as CmsData[K][number];

  await updateConfig((previous) => ({
    [collection]: [nextItem, ...(previous[collection] || [])],
  }) as any);

  return nextItem;
};

export const updateCollectionItem = async <K extends CmsCollectionKey>(
  collection: K,
  id: string,
  payload: Partial<Omit<CmsData[K][number], "id">>,
): Promise<CmsData[K][number] | null> => {
  let updated: CmsData[K][number] | null = null;

  await updateConfig((previous) => {
    const next = (previous[collection] || []).map((item: any) => {
      if (item.id !== id) return item;
      updated = { ...item, ...payload } as any;
      return updated;
    });
    return { [collection]: next } as any;
  });

  return updated;
};

export const deleteCollectionItem = async <K extends CmsCollectionKey>(
  collection: K,
  id: string,
): Promise<boolean> => {
  let removed = false;

  await updateConfig((previous) => {
    const next = (previous[collection] || []).filter((item: any) => {
      if (item.id === id) {
        removed = true;
        return false;
      }
      return true;
    });
    return { [collection]: next } as any;
  });

  return removed;
};
