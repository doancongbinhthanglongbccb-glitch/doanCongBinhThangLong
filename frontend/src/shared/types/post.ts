export type PostStatus = "draft" | "published" | "archived";

export type WorkflowStatus = "draft" | "pending" | "approved" | "published" | "archived";

export type PostReview = {
  submittedAt?: string | null;
  submittedBy?: { id: string; username?: string } | string | null;
  reviewedAt?: string | null;
  reviewedBy?: { id: string; username?: string } | string | null;
  decisionNote?: string;
};

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
  workflowStatus?: WorkflowStatus;
  review?: PostReview;
  revision?: {
    current?: number;
    lastPublished?: number;
  };
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  viewCount?: number;
  categoryIds?: string[];
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
  excerpt?: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryIds?: string[];
};

export type UpdatePostInput = Partial<
  Pick<Post, "title" | "slug" | "content" | "thumbnail" | "status" | "excerpt" | "seoTitle" | "seoDescription" | "categoryIds">
>;
