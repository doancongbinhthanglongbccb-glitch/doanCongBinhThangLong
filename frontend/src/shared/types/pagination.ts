/**
 * Canonical pagination shape returned by the backend.
 *
 * Mirrors the `Page[T]` schema from the reference project
 * (`website_lu_doan/backend/app/schemas/cms/post.py::PostList`):
 *   { items, total, page, size, pages }
 */
export type Page<Item> = {
  items: Item[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

/**
 * Legacy shape returned by older endpoints.
 *
 * The frontend adapters in `services/api/postApi.ts` and
 * `features/posts/services/posts.service.ts` accept both the canonical
 * `Page<T>` shape and this legacy one to ease the migration.
 */
export type LegacyPaginatedResponse<Item> = {
  data: Item[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
