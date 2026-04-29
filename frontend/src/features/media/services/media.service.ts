import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "@/services/api/endpoints";
import type { MediaListResponse, MediaUploadResponse } from "../types/media.types";

export const listMedia = async (options?: { limit?: number; page?: number; search?: string }): Promise<MediaListResponse> => {
  const params: Record<string, unknown> = {};
  if (options?.limit) params.limit = options.limit;
  if (options?.page) params.page = options.page;
  if (options?.search) params.search = options.search;
  const { data } = await axiosClient.get<MediaListResponse>(ApiEndpoints.media, { params });
  return data;
};

export const uploadMedia = async (file: File): Promise<MediaUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axiosClient.post<MediaUploadResponse>(ApiEndpoints.mediaUpload, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const deleteMedia = async (id: string): Promise<void> => {
  await axiosClient.delete(`${ApiEndpoints.media}/${encodeURIComponent(id)}`);
};

