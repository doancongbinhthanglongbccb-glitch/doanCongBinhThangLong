import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "@/services/api/endpoints";
import type {
  Category,
  CategoryTreeNode,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";

export const getCategoriesTree = async (options?: { visible?: boolean }): Promise<CategoryTreeNode[]> => {
  const params = options?.visible === false ? { visible: "false" } : undefined;
  const { data } = await axiosClient.get<{ items: CategoryTreeNode[] }>(ApiEndpoints.categoriesTree, { params });
  return data.items || [];
};

export const listCategoriesAdmin = async (): Promise<Category[]> => {
  const { data } = await axiosClient.get<{ items: Category[] }>(ApiEndpoints.categories);
  return data.items || [];
};

export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  const { data } = await axiosClient.post<Category>(ApiEndpoints.categories, payload);
  return data;
};

export const updateCategory = async (id: string, payload: UpdateCategoryPayload): Promise<Category> => {
  const { data } = await axiosClient.put<Category>(`${ApiEndpoints.categories}/${encodeURIComponent(id)}`, payload);
  return data;
};

export const deleteCategory = async (id: string, options?: { force?: boolean }): Promise<void> => {
  const params = options?.force ? { force: "true" } : undefined;
  await axiosClient.delete(`${ApiEndpoints.categories}/${encodeURIComponent(id)}`, { params });
};
