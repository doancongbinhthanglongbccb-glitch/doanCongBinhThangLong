import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "@/services/api/endpoints";
import type { MediaListResponse, MediaUploadResponse } from "../types/media.types";

export const listMedia = async (options?: { limit?: number }): Promise<MediaListResponse> => {
  const params: Record<string, unknown> = {};
  if (options?.limit) params.limit = options.limit;
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

