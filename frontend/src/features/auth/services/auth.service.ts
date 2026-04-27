import axios from "axios";
import { API_BASE_URL } from "@/config/apiBaseUrl";
import { ApiEndpoints } from "@/services/api/endpoints";
import { ROUTES } from "@/lib/constants";
import { hasRole } from "../domain/roles";
import type { LoginPayload, AuthResponse, User, Role } from "../types/auth.types";

const AUTH_SYNC_KEY = "doan.auth.sync";

let accessToken = "";
let authUser: User | null = null;

const clearAuthState = () => {
  accessToken = "";
  authUser = null;
};

const publishAuthEvent = (type: string) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify({ type, at: Date.now() });
  window.localStorage.setItem(AUTH_SYNC_KEY, payload);
  window.localStorage.removeItem(AUTH_SYNC_KEY);
};

// Cross-tab auth sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== AUTH_SYNC_KEY || !event.newValue) {
      return;
    }

    try {
      const payload = JSON.parse(event.newValue);
      if (payload?.type === "logout") {
        clearAuthState();

        if (window.location.pathname !== ROUTES.LOGIN) {
          const redirectTarget = `${window.location.pathname}${window.location.search}`;
          const redirectQuery = encodeURIComponent(redirectTarget);
          window.location.assign(`${ROUTES.LOGIN}?redirect=${redirectQuery}`);
        }
      }
    } catch {
      // Ignore malformed cross-tab auth sync payloads.
    }
  });
}

export const getAccessToken = () => accessToken;

export const setTokens = ({ accessToken: nextAccessToken }: { accessToken: string }) => {
  if (nextAccessToken) {
    accessToken = nextAccessToken;
  }
};

export const getAuthUser = (): User | null => authUser;

export const setAuthUser = (user: User | null) => {
  authUser = user || null;
};

export const getUserRole = () => getAuthUser()?.role || "";

// Single source of truth lives in `features/auth/domain/roles.ts::hasRole`.
// `hasRoleAccess` keeps the historical name used throughout the app while
// delegating the actual hierarchy logic so behaviour stays in sync with the
// backend `domain/roles.js`.
export const hasRoleAccess = (requiredRole?: Role) => hasRole(getUserRole(), requiredRole);

export const clearTokens = (options = { broadcast: true }) => {
  clearAuthState();

  if (options.broadcast !== false) {
    publishAuthEvent("logout");
  }
};

export const isLoggedIn = () => Boolean(getAccessToken());

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const data = {
    password: payload.password,
    ...(payload.email && { email: payload.email }),
    ...(payload.username && { username: payload.username }),
  };

  const response = await axios.post(`${API_BASE_URL}${ApiEndpoints.authLogin}`, data, {
    withCredentials: true,
  });

  const accessToken = response.data?.accessToken || response.data?.token || "";

  if (!accessToken) {
    throw new Error("Login response does not contain accessToken");
  }

  setTokens({ accessToken });
  setAuthUser(response.data?.user || null);
  
  return {
    accessToken,
    user: response.data?.user || null,
  };
};

export const refreshAccessToken = async (): Promise<string> => {
  const response = await axios.post(
    `${API_BASE_URL}${ApiEndpoints.authRefresh}`,
    {},
    { withCredentials: true }
  );

  const accessToken = response.data?.accessToken || "";

  if (!accessToken) {
    throw new Error("Refresh response does not contain accessToken");
  }

  setTokens({ accessToken });
  if (response.data?.user) {
    setAuthUser(response.data.user);
  }

  return accessToken;
};

export const ensureSession = async (): Promise<boolean> => {
  if (getAccessToken()) {
    if (!getAuthUser()) {
      try {
        await refreshAccessToken();
      } catch {
        clearTokens();
        return false;
      }
    }

    return true;
  }

  try {
    await refreshAccessToken();
    return true;
  } catch {
    clearTokens();
    return false;
  }
};

export const logout = async (redirectTo: string = ROUTES.LOGIN): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}${ApiEndpoints.authLogout}`, {}, { withCredentials: true });
  } catch {
    // Ignore logout API errors and clear local auth state anyway.
  }

  clearTokens();

  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== redirectTo) {
    window.location.assign(redirectTo);
  }
};
