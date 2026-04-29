export type UserRole = "admin" | "editor";

export type UserListItem = {
  id: string;
  username: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type UserListResponse = {
  items: UserListItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
};

