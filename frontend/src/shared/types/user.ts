export interface User {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "editor" | "viewer";
  email?: string;
  createdAt: string;
  updatedAt?: string;
  active: boolean;
}

export type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUserInput = Partial<Omit<User, "id" | "createdAt">>;
