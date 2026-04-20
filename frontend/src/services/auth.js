import axios from "axios";
import { API_BASE_URL } from "@/config/apiBaseUrl";
import { ApiEndpoints } from "@/services/api/endpoints";

const AUTH_SYNC_KEY = "doan.auth.sync";

let accessToken = "";
let authUser = null;

const clearAuthState = () => {
  accessToken = "";
  authUser = null;
};

const publishAuthEvent = (type) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify({ type, at: Date.now() });
  window.localStorage.setItem(AUTH_SYNC_KEY, payload);
  window.localStorage.removeItem(AUTH_SYNC_KEY);
};

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== AUTH_SYNC_KEY || !event.newValue) {
      return;
    }

    try {
      const payload = JSON.parse(event.newValue);
      if (payload?.type === "logout") {
        clearAuthState();

        if (window.location.pathname !== "/login") {
          const redirectTarget = `${window.location.pathname}${window.location.search}`;
          const redirectQuery = encodeURIComponent(redirectTarget);
          window.location.assign(`/login?redirect=${redirectQuery}`);
        }
      }
    } catch {
      // Ignore malformed cross-tab auth sync payloads.
    }
  });
}

export const getAccessToken = () => {
  return accessToken;
};

export const setTokens = ({ accessToken: nextAccessToken }) => {
  if (nextAccessToken) {
    accessToken = nextAccessToken;
  }
};

export const getAuthUser = () => {
  return authUser;
};

export const setAuthUser = (user) => {
  authUser = user || null;
};

export const getUserRole = () => getAuthUser()?.role || "";

export const hasRoleAccess = (requiredRole) => {
  if (!requiredRole) {
    return true;
  }

  const role = getUserRole();
  if (!role) {
    return false;
  }

  if (requiredRole === "admin") {
    return role === "admin";
  }

  if (requiredRole === "editor") {
    return role === "admin" || role === "editor";
  }

  return role === requiredRole;
};

export const clearTokens = (options = {}) => {
  clearAuthState();

  if (options.broadcast !== false) {
    publishAuthEvent("logout");
  }
};

export const isLoggedIn = () => Boolean(getAccessToken());

export const login = async ({ email, password }) => {
  const payload = {
    password,
  };

  if (email.includes("@")) {
    payload.email = email;
  } else {
    payload.username = email;
  }

  const { data } = await axios.post(`${API_BASE_URL}${ApiEndpoints.authLogin}`, payload, {
    withCredentials: true,
  });

  const accessToken = data?.accessToken || data?.token || "";

  if (!accessToken) {
    throw new Error("Login response does not contain accessToken");
  }

  setTokens({ accessToken });
  setAuthUser(data?.user || null);
  return {
    accessToken,
    user: data?.user || null,
  };
};

export const refreshAccessToken = async () => {
  const { data } = await axios.post(`${API_BASE_URL}${ApiEndpoints.authRefresh}`, {}, { withCredentials: true });
  const accessToken = data?.accessToken || "";

  if (!accessToken) {
    throw new Error("Refresh response does not contain accessToken");
  }

  setTokens({ accessToken });
  if (data?.user) {
    setAuthUser(data.user);
  }
  return accessToken;
};

export const ensureSession = async () => {
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

export const logout = async (redirectTo = "/login") => {
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
