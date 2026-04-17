import type { CreatePostInput, Post, UpdatePostInput } from "@/shared/types/post";
import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "./endpoints";

type BackendPost = {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  status?: "draft" | "published";
  publishedAt?: string;
  author?: {
    _id?: string;
    id?: string;
    username?: string;
    role?: "admin" | "editor";
  };
  createdAt?: string;
  updatedAt?: string;
};

type PaginatedPublishedPostsResponse = {
  data: BackendPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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
  category: "Tin tuc",
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

export const getPosts = async (): Promise<Post[]> => {
  const response = await axiosClient.get<PaginatedPublishedPostsResponse | BackendPost[]>(ApiEndpoints.posts);
  const payload = response.data;
  const items = Array.isArray(payload) ? payload : payload?.data || [];
  return items.map(mapPost);
};

export const getCmsPosts = async (): Promise<Post[]> => {
  const { data } = await axiosClient.get<BackendPost[]>(ApiEndpoints.cmsPosts);

  if (import.meta.env.DEV) {
    console.debug("[getCmsPosts] raw response", data);
  }

  const mapped = (data || []).map(mapPost);
  const uniqueById = Array.from(new Map(mapped.map((post) => [(post._id || post.id), post])).values());

  if (import.meta.env.DEV && mapped.length !== uniqueById.length) {
    console.debug("[getCmsPosts] duplicates removed", {
      originalCount: mapped.length,
      uniqueCount: uniqueById.length,
    });
  }

  return uniqueById;
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const posts = await getCmsPosts();
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
