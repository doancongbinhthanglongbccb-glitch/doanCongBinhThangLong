export const ApiEndpoints = {
  authLogin: "/api/auth/login",
  authRefresh: "/api/auth/refresh",
  authLogout: "/api/auth/logout",
  config: "/api/config",
  posts: "/api/posts",
  cmsPosts: "/api/posts/cms",
  postById: (id: string) => `/api/posts/${id}`,
  postPublish: (id: string) => `/api/posts/${id}/publish`,
  postBySlug: (slug: string) => `/api/posts/${slug}`,
} as const;
