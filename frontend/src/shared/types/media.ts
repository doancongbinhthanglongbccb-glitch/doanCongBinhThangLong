export interface MediaItem {
  id: string;
  title: string;
  type: string;
  url: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateMediaInput = Omit<MediaItem, "id">;
export type UpdateMediaInput = Partial<Omit<MediaItem, "id">>;
