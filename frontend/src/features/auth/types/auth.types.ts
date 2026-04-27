// `Role` is a string-literal union derived from the canonical `UserRole` enum
// in `features/auth/domain/roles.ts`. Re-exporting it here keeps the existing
// import paths (`from "../types/auth.types"`) working without duplicating
// the literals.
export type { Role } from "../domain/roles";

export interface User {
  id?: string;
  _id: string;
  email: string;
  username?: string;
  name?: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user?: User | null;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>;
  clearError: () => void;
  hasRoleAccess: (requiredRole: Role) => boolean;
}
