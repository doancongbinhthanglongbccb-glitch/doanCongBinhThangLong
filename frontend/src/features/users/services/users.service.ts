import axiosClient from "@/services/axiosClient";
import { ApiEndpoints } from "@/services/api/endpoints";
import type { UserListResponse, UserRole, UserListItem } from "../types/user.types";

export type UserListQuery = {
  search?: string;
  role?: UserRole | "all";
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
};

export const listUsers = async (query: UserListQuery = {}): Promise<UserListResponse> => {
  const { data } = await axiosClient.get<UserListResponse>(ApiEndpoints.users, {
    params: {
      search: query.search?.trim() || undefined,
      role: query.role && query.role !== "all" ? query.role : undefined,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
    },
  });
  return data;
};

export const updateUserRole = async (id: string, role: UserRole): Promise<UserListItem> => {
  const { data } = await axiosClient.patch<UserListItem>(ApiEndpoints.userRole(id), { role });
  return data;
};

