export const ApiEndpoints = {
  cms: "/api/cms",
  cmsCollection: (collection: string) => `/api/cms/${collection}`,
  cmsCollectionItem: (collection: string, id: string) => `/api/cms/${collection}/${id}`,
  posts: "/api/posts",
  postById: (id: string) => `/api/posts/${id}`,
  users: "/api/users",
  userById: (id: string) => `/api/users/${id}`,
  media: "/api/media",
  mediaById: (id: string) => `/api/media/${id}`,
} as const;
