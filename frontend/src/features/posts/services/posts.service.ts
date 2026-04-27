import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "@/services/api/endpoints";
import type {
  Post,
  CreatePostInput,
  UpdatePostInput,
  PostListQuery,
  PostListResponse,
} from "../types/posts.types";

type BackendPost = {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  status?: "draft" | "published" | "archived";
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
  // Legacy label kept for old UI, but no longer hardcoded.
  category: "",
  categoryIds: item.categoryIds || [],
  excerpt: item.excerpt || "",
  seoTitle: item.seoTitle || "",
  seoDescription: item.seoDescription || "",
  viewCount: typeof item.viewCount === "number" ? item.viewCount : 0,
  author: item.author
    ? {
        id: item.author._id || item.author.id || "",
        username: item.author.username || "",
        role: (item.author.role as "admin" | "editor") || "editor",
      }
    : undefined,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

type CanonicalPaginatedBackend = {
  items: BackendPost[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

type LegacyPaginatedBackend = {
  data: BackendPost[];
  pagination: PostListResponse["pagination"];
};

type PaginatedBackendPostResponse = CanonicalPaginatedBackend | LegacyPaginatedBackend;

const normalizePaginatedResponse = (
  payload: PaginatedBackendPostResponse | BackendPost[] | null | undefined,
  fallbackQuery: PostListQuery,
): PostListResponse => {
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
      data: payload.map(mapPost),
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
      data: (payload.items || []).map(mapPost),
      pagination: {
        page: payload.page,
        limit: payload.size,
        total: payload.total,
        totalPages: payload.pages,
      },
    };
  }

  return {
    data: (payload.data || []).map(mapPost),
    pagination: payload.pagination,
  };
};

export const getPublicPosts = async (query: PostListQuery = {}): Promise<PostListResponse> => {
  const { data } = await axiosClient.get<PaginatedBackendPostResponse | BackendPost[]>(ApiEndpoints.posts, {
    params: query,
  });
  return normalizePaginatedResponse(data, query);
};

export const getCmsPosts = async (query: PostListQuery = {}): Promise<PostListResponse> => {
  const { data } = await axiosClient.get<PaginatedBackendPostResponse | BackendPost[]>(ApiEndpoints.cmsPosts, {
    params: query,
  });
  return normalizePaginatedResponse(data, query);
};

export const getAllCmsPosts = async (): Promise<Post[]> => {
  const { data } = await axiosClient.get<PaginatedBackendPostResponse | BackendPost[]>(ApiEndpoints.cmsPosts);

  const normalized = normalizePaginatedResponse(data, {});
  return Array.from(
    new Map<string, Post>(
      normalized.data.map((post) => [(post._id || post.id) as string, post]),
    ).values(),
  );
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const posts = await getAllCmsPosts();
  return posts.find((item) => item.id === id) || null;
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const { data } = await axiosClient.get<BackendPost>(ApiEndpoints.postBySlug(slug));
  return data ? mapPost(data) : null;
};

export const createPost = async (payload: CreatePostInput): Promise<Post> => {
  const { data } = await axiosClient.post<BackendPost>(ApiEndpoints.posts, payload);
  return mapPost(data);
};

export const updatePost = async (id: string, payload: UpdatePostInput): Promise<Post | null> => {
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
