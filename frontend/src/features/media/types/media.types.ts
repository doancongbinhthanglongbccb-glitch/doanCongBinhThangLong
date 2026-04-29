export type MediaAsset = {
  _id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  url: string;
  createdBy?: { _id?: string; id?: string; username?: string; role?: "admin" | "editor" } | string | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaListResponse = {
  items: MediaAsset[];
  total?: number;
  page?: number;
  size?: number;
  pages?: number;
};

export type MediaUploadResponse = {
  item: MediaAsset;
};

