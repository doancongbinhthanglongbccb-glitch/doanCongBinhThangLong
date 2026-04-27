export type PostStatus = "draft" | "published" | "archived";

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
  category?: string;
  categoryIds?: string[];
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  viewCount?: number;
  date?: string;
  image?: string;
}

export type CreatePostInput = Pick<Post, "title" | "content"> & {
  slug?: string;
  thumbnail?: string;
  status?: Exclude<PostStatus, "archived">;
  categoryIds?: string[];
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type UpdatePostInput = Partial<
  Pick<
    Post,
    "title" | "slug" | "content" | "thumbnail" | "status" | "categoryIds" | "excerpt" | "seoTitle" | "seoDescription"
  >
>;

export type PostListQuery = {
  search?: string;
  status?: PostStatus;
  author?: string;
  sort?: "newest" | "oldest";
  categoryId?: string;
  categorySlug?: string;
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
