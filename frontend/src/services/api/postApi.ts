import type { CreatePostInput, Post, PostReview, UpdatePostInput } from "@/shared/types/post";
import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "./endpoints";

export type PostListQuery = {
  search?: string;
  status?: "draft" | "published";
  author?: string;
  sort?: "newest" | "oldest";
  page?: number;
  limit?: number;
};

export type PostListResponse = {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type BackendPost = {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  status?: "draft" | "published" | "archived";
  workflowStatus?: "draft" | "pending" | "approved" | "published" | "archived";
  review?: {
    submittedAt?: string | null;
    submittedBy?: { _id?: string; id?: string; username?: string } | string | null;
    reviewedAt?: string | null;
    reviewedBy?: { _id?: string; id?: string; username?: string } | string | null;
    decisionNote?: string;
  };
  revision?: {
    current?: number;
    lastPublished?: number;
  };
  publishedAt?: string;
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  viewCount?: number;
  categoryIds?: string[];
  author?: {
    _id?: string;
    id?: string;
    username?: string;
    role?: "admin" | "editor";
  };
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Canonical pagination shape returned by the backend
 * (`{ items, total, page, size, pages }`).
 *
 * The legacy shape `{ data, pagination: { page, limit, total, totalPages } }`
 * is still accepted by `normalizePaginatedResponse` for backwards compatibility
 * with any caller that has not been migrated yet.
 */
type CanonicalPaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

type LegacyPaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type PaginatedBackendPostResponse =
  | CanonicalPaginatedResponse<BackendPost>
  | LegacyPaginatedResponse<BackendPost>;

type BackendUserRef = { _id?: string; id?: string; username?: string } | string | null | undefined;

const normalizeUserRef = (value: BackendUserRef): PostReview["submittedBy"] => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") return value;

  const id = value.id || value._id || "";
  if (!id) return null;
  return { id, username: value.username };
};

const normalizeReview = (review?: BackendPost["review"]): PostReview | undefined => {
  if (!review) return undefined;
  return {
    submittedAt: review.submittedAt ?? null,
    submittedBy: normalizeUserRef(review.submittedBy),
    reviewedAt: review.reviewedAt ?? null,
    reviewedBy: normalizeUserRef(review.reviewedBy),
    decisionNote: review.decisionNote || "",
  };
};

const normalizePaginatedResponse = <Item, Mapped>(
  payload: CanonicalPaginatedResponse<Item> | LegacyPaginatedResponse<Item> | Item[] | null | undefined,
  fallbackQuery: PostListQuery,
  map: (item: Item) => Mapped,
): { data: Mapped[]; pagination: PostListResponse["pagination"] } => {
  if (!payload) {
    return {
      data: [],
      pagination: {
        page: fallbackQuery.page || 1,
        limit: fallbackQuery.limit || 10,
        total: 0,
        totalPages: 1,
      },
    };
  }

  if (Array.isArray(payload)) {
    return {
      data: payload.map(map),
      pagination: {
        page: fallbackQuery.page || 1,
        limit: fallbackQuery.limit || payload.length || 10,
        total: payload.length,
        totalPages: 1,
      },
    };
  }

  if ("items" in payload) {
    return {
      data: (payload.items || []).map(map),
      pagination: {
        page: payload.page,
        limit: payload.size,
        total: payload.total,
        totalPages: payload.pages,
      },
    };
  }

  return {
    data: (payload.data || []).map(map),
    pagination: payload.pagination,
  };
};

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const mapPost = (item: BackendPost): Post => ({
  _id: item._id || item.id || "",
  id: item._id || item.id || "",
  title: item.title,
  slug: item.slug,
  content: item.content,
  thumbnail: item.thumbnail || "",
  image: item.thumbnail || "",
  status: item.status || "draft",
  publishedAt: item.publishedAt,
  date: formatDate(item.publishedAt || item.createdAt),
  category: "",
  categoryIds: item.categoryIds || [],
  excerpt: item.excerpt || "",
  seoTitle: item.seoTitle || "",
  seoDescription: item.seoDescription || "",
  workflowStatus: item.workflowStatus,
  review: normalizeReview(item.review),
  revision: item.revision,
  viewCount: typeof item.viewCount === "number" ? item.viewCount : 0,
  author: item.author
    ? {
        id: item.author._id || item.author.id || "",
        username: item.author.username || "",
        role: item.author.role || "editor",
      }
    : undefined,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export const getPublicPosts = async (query: PostListQuery = {}): Promise<PostListResponse> => {
  const { data } = await axiosClient.get<PaginatedBackendPostResponse | BackendPost[]>(ApiEndpoints.posts, {
    params: query,
  });

  return normalizePaginatedResponse<BackendPost, Post>(data, query, mapPost);
};

export const getPosts = async (query: PostListQuery = {}): Promise<PostListResponse> => {
  const { data } = await axiosClient.get<PaginatedBackendPostResponse | BackendPost[]>(ApiEndpoints.cmsPosts, {
    params: query,
  });

  return normalizePaginatedResponse<BackendPost, Post>(data, query, mapPost);
};

export const getCmsPosts = async (): Promise<Post[]> => {
  const { data } = await axiosClient.get<PaginatedBackendPostResponse | BackendPost[]>(ApiEndpoints.cmsPosts);

  const normalized = normalizePaginatedResponse<BackendPost, Post>(data, {}, mapPost);
  // The CMS list endpoint may return overlapping posts when paginated under
  // the hood; deduplicate by id before handing the array to the admin UI.
  return Array.from(
    new Map<string, Post>(
      normalized.data.map((post) => [(post._id || post.id) as string, post]),
    ).values(),
  );
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const { data } = await axiosClient.get<BackendPost>(ApiEndpoints.cmsPostById(id));
  return data ? mapPost(data) : null;
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const { data } = await axiosClient.get<BackendPost>(ApiEndpoints.postBySlug(slug));
  return data ? mapPost(data) : null;
};

export const createPost = async (payload: CreatePostInput): Promise<Post> => {
  const { data } = await axiosClient.post<BackendPost>(ApiEndpoints.posts, payload);
  return mapPost(data);
};

export const updatePost = async (
  id: string,
  payload: UpdatePostInput,
): Promise<Post | null> => {
  const { data } = await axiosClient.put<BackendPost>(ApiEndpoints.postById(id), payload);
  return data ? mapPost(data) : null;
};

export const deletePost = async (id: string): Promise<boolean> => {
  await axiosClient.delete(ApiEndpoints.postById(id));
  return true;
};

export const publishPost = async (id: string): Promise<Post | null> => {
  const { data } = await axiosClient.put<BackendPost>(ApiEndpoints.postPublish(id));
  return data ? mapPost(data) : null;
};

export const submitPost = async (id: string): Promise<Post | null> => {
  const { data } = await axiosClient.post<BackendPost>(ApiEndpoints.postSubmit(id), {});
  return data ? mapPost(data) : null;
};

export const approvePost = async (id: string): Promise<Post | null> => {
  const { data } = await axiosClient.post<BackendPost>(ApiEndpoints.postApprove(id), {});
  return data ? mapPost(data) : null;
};

export const rejectPost = async (id: string, note: string): Promise<Post | null> => {
  const { data } = await axiosClient.post<BackendPost>(ApiEndpoints.postReject(id), { note });
  return data ? mapPost(data) : null;
};

export const unpublishPost = async (id: string): Promise<Post | null> => {
  const { data } = await axiosClient.post<BackendPost>(ApiEndpoints.postUnpublish(id), {});
  return data ? mapPost(data) : null;
};
