import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "@/services/api/endpoints";
import type { Post } from "@/shared/types/post";

export type PostEditorSavePayload = {
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  categoryIds: string[];
};

export async function createPostDraft(
  payload: PostEditorSavePayload,
  signal?: AbortSignal
): Promise<Post> {
  const { data } = await axiosClient.post<Post>(ApiEndpoints.posts, payload, { signal });
  return data;
}

export async function updatePostDraft(
  postId: string,
  payload: PostEditorSavePayload,
  signal?: AbortSignal
): Promise<Post> {
  const { data } = await axiosClient.put<Post>(ApiEndpoints.postById(postId), payload, { signal });
  return data;
}

export async function submitPostForReview(postId: string): Promise<Post> {
  const { data } = await axiosClient.post<Post>(ApiEndpoints.postSubmit(postId), {});
  return data;
}

export async function publishPost(postId: string): Promise<Post> {
  const { data } = await axiosClient.put<Post>(ApiEndpoints.postPublish(postId), {});
  return data;
}

export async function rejectPost(postId: string, note: string): Promise<Post> {
  const { data } = await axiosClient.post<Post>(ApiEndpoints.postReject(postId), { note });
  return data;
}
