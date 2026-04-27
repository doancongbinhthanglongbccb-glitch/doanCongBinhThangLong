export type MediaAsset = {
  _id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MediaListResponse = {
  items: MediaAsset[];
};

export type MediaUploadResponse = {
  item: MediaAsset;
};

