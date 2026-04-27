import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/auth.service";
import type { User, LoginPayload, Role } from "../types/auth.types";

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(authService.getAuthUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sync with localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "doan.auth.sync" && !event.newValue) {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (credentials: LoginPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setUser(response.user || null);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (redirectTo?: string) => {
    try {
      await authService.logout(redirectTo);
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Logout failed");
      throw err;
    }
  };

  const refreshToken = async () => {
    try {
      const newToken = await authService.refreshAccessToken();
      setUser(authService.getAuthUser());
      return newToken;
    } catch (err: any) {
      setError(err.message || "Token refresh failed");
      setUser(null);
      throw err;
    }
  };

  const clearError = () => setError(null);

  const hasRoleAccess = (requiredRole?: Role) => authService.hasRoleAccess(requiredRole);

  return {
    user,
    isLoading,
    error,
    isLoggedIn: authService.isLoggedIn(),
    login,
    logout,
    refreshToken,
    clearError,
    hasRoleAccess,
  };
};
