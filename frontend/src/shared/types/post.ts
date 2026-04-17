export type PostStatus = "draft" | "published";

export interface PostAuthor {
  id: string;
  username: string;
  role: "admin" | "editor";
}

export interface Post {
  _id?: string;
  id: string;
  title: string;
  slug: string;
  content: string;
  thumbnail?: string;
  status: PostStatus;
  publishedAt?: string;
  author?: PostAuthor;
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields kept optional for existing public rendering components.
  category?: string;
  date?: string;
  image?: string;
}

export type CreatePostInput = Pick<Post, "title" | "content"> & {
  slug?: string;
  thumbnail?: string;
  status?: PostStatus;
};

export type UpdatePostInput = Partial<Pick<Post, "title" | "slug" | "content" | "thumbnail" | "status">>;
