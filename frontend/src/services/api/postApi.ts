import type { CreatePostInput, Post, UpdatePostInput } from "@/shared/types/post";
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

export const getPublicPosts = async (query: PostListQuery = {}): Promise<PostListResponse> => {
  const { data } = await axiosClient.get<PaginatedPublishedPostsResponse | BackendPost[]>(ApiEndpoints.posts, {
    params: query,
  });

  if (Array.isArray(data)) {
    return {
      data: data.map(mapPost),
      pagination: {
        page: query.page || 1,
        limit: query.limit || data.length || 10,
        total: data.length,
        totalPages: 1,
      },
    };
  }

  return {
    data: (data?.data || []).map(mapPost),
    pagination: data.pagination,
  };
};

export const getPosts = async (query: PostListQuery = {}): Promise<PostListResponse> => {
  const { data } = await axiosClient.get<PostListResponse>(ApiEndpoints.cmsPosts, {
    params: query,
  });

  if (Array.isArray(data)) {
    return {
      data: data.map(mapPost),
      pagination: {
        page: query.page || 1,
        limit: query.limit || data.length || 10,
        total: data.length,
        totalPages: 1,
      },
    };
  }

  return {
    data: (data?.data || []).map(mapPost),
    pagination: data.pagination,
  };
};

export const getCmsPosts = async (): Promise<Post[]> => {
  const { data } = await axiosClient.get<PostListResponse | BackendPost[]>(ApiEndpoints.cmsPosts);

  if (Array.isArray(data)) {
    const mapped = data.map(mapPost);
    return Array.from(new Map<string, Post>(mapped.map((post) => [(post._id || post.id) as string, post])).values());
  }

  const mapped = (data?.data || []).map(mapPost);
  const uniqueById = Array.from(new Map<string, Post>(mapped.map((post) => [(post._id || post.id) as string, post])).values());

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
