import type { CreateMediaInput, MediaItem, UpdateMediaInput } from "@/shared/types/media";
import { createCollectionItem, deleteCollectionItem, getCmsData, updateCollectionItem } from "./cmsApi";

export const getMedia = async (): Promise<MediaItem[]> => {
  const data = await getCmsData();
  return data.thuVien as MediaItem[];
};

export const getMediaById = async (id: string): Promise<MediaItem | null> => {
  const items = await getMedia();
  return items.find((item) => item.id === id) ?? null;
};

export const createMedia = async (payload: CreateMediaInput): Promise<MediaItem> =>
  (await createCollectionItem("thuVien", payload)) as MediaItem;

export const updateMedia = async (id: string, payload: UpdateMediaInput): Promise<MediaItem | null> =>
  (await updateCollectionItem("thuVien", id, payload)) as MediaItem | null;

export const deleteMedia = async (id: string): Promise<boolean> => deleteCollectionItem("thuVien", id);
