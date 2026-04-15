import type { CreatePostInput, Post, UpdatePostInput } from "@/shared/types/post";
import { createCollectionItem, deleteCollectionItem, getCmsData, updateCollectionItem } from "./cmsApi";

export const getPosts = async (): Promise<Post[]> => {
  const data = await getCmsData();
  return data.activities as Post[];
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const posts = await getPosts();
  return posts.find((item) => item.id === id) ?? null;
};

export const createPost = async (data: CreatePostInput): Promise<Post> =>
  (await createCollectionItem("activities", data)) as Post;

export const updatePost = async (
  id: string,
  data: UpdatePostInput,
): Promise<Post | null> => (await updateCollectionItem("activities", id, data)) as Post | null;

export const deletePost = async (id: string): Promise<boolean> => deleteCollectionItem("activities", id);
