export type Category = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  order?: number;
  visible?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryTreeNode = Category & {
  children: CategoryTreeNode[];
};

export type CreateCategoryPayload = {
  name: string;
  slug?: string;
  parentId?: string | null;
  order?: number;
  visible?: boolean;
  description?: string;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
