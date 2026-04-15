export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  date: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreatePostInput = Omit<Post, "id">;
export type UpdatePostInput = Partial<Omit<Post, "id">>;
