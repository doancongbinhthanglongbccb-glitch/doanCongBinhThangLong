/**
 * Application-wide route + API path constants.
 *
 * Pattern adopted from `website_lu_doan/frontend/src/lib/constants.ts`:
 * keep navigation and API endpoints in a single file so consumers do not
 * scatter literal strings (`"/login"`, `"/api/posts"`, ...) across the app.
 *
 * Two namespaces:
 *
 * - `ROUTES`: client-side React Router paths used by `<Link>`, `<Navigate>`
 *   and `window.location.assign(...)`.
 * - `API_ROUTES`: backend HTTP endpoint paths used by axios. Mirrors
 *   `services/api/endpoints.ts`; that file remains authoritative for
 *   request building, but `API_ROUTES` provides a flat lookup for callers
 *   that only need a string constant.
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",

  ADMIN_ROOT: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_POSTS: "/admin/posts",
  ADMIN_CONFIG: "/admin/config",
  ADMIN_USERS: "/admin/users",
} as const;

export const API_ROUTES = {
  AUTH_LOGIN: "/api/auth/login",
  AUTH_SESSION: "/api/auth/session",
  AUTH_REFRESH: "/api/auth/refresh",
  AUTH_LOGOUT: "/api/auth/logout",

  CONFIG: "/api/config",
  CONFIG_KEYS: "/api/config/keys",
  /** Top-level site config section, e.g. `footer` */
  CONFIG_ENTRY: (key: string) => `/api/config/entries/${encodeURIComponent(key)}`,

  POSTS: "/api/posts",
  CMS_POSTS: "/api/posts/cms",
  POST_BY_ID: (id: string) => `/api/posts/${id}`,
  POST_PUBLISH: (id: string) => `/api/posts/${id}/publish`,
  POST_BY_SLUG: (slug: string) => `/api/posts/${slug}`,
} as const;

export type RouteKey = keyof typeof ROUTES;
export type ApiRouteKey = keyof typeof API_ROUTES;
