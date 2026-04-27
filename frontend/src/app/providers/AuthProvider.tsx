import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from "react";
import * as authService from "@/features/auth/services/auth.service";
import type { User, Role } from "@/features/auth";

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  isChecking: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasRole: (role: Role) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(authService.getAuthUser());
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const sessionOk = await authService.ensureSession();
        if (mounted) {
          if (sessionOk) {
            setUser(authService.getAuthUser());
          }
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Session check failed");
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    void checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen for cross-tab logout
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "doan.auth.sync" && !event.newValue) {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      setUser(response.user || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
      throw err;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshAccessToken();
      setUser(authService.getAuthUser());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Token refresh failed");
      setUser(null);
      throw err;
    }
  }, []);

  const hasRole = useCallback((role: Role) => authService.hasRoleAccess(role), []);

  const value: AuthContextValue = {
    user,
    isLoggedIn: !!user,
    isChecking,
    error,
    login,
    logout,
    refreshToken,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
