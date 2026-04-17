import axios from "axios";
import { ApiEndpoints } from "@/services/api/endpoints";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const AUTH_USER_KEY = "authUser";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getAccessToken = () => {
  if (!canUseStorage()) {
    return "";
  }
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) || "";
};

export const getRefreshToken = () => {
  if (!canUseStorage()) {
    return "";
  }
  return window.localStorage.getItem(REFRESH_TOKEN_KEY) || "";
};

export const setTokens = ({ accessToken, refreshToken }) => {
  if (!canUseStorage()) {
    return;
  }

  if (accessToken) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getAuthUser = () => {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setAuthUser = (user) => {
  if (!canUseStorage()) {
    return;
  }

  if (!user) {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
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

export const clearTokens = () => {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
};

export const isLoggedIn = () => Boolean(getAccessToken());

export const login = async ({ email, password }) => {
  const { data } = await axios.post(`${API_BASE_URL}${ApiEndpoints.authLogin}`, {
    email,
    password,
    username: email,
  });

  const accessToken = data?.accessToken || data?.token || "";
  const refreshToken = data?.refreshToken || "";

  if (!accessToken) {
    throw new Error("Login response does not contain accessToken");
  }

  setTokens({ accessToken, refreshToken });
  setAuthUser(data?.user || null);
  return {
    accessToken,
    refreshToken,
    user: data?.user || null,
  };
};

export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Refresh token is missing");
  }

  const { data } = await axios.post(`${API_BASE_URL}${ApiEndpoints.authRefresh}`, { refreshToken });
  const accessToken = data?.accessToken || "";

  if (!accessToken) {
    throw new Error("Refresh response does not contain accessToken");
  }

  setTokens({ accessToken });
  return accessToken;
};

export const logout = (redirectTo = "/login") => {
  clearTokens();

  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== redirectTo) {
    window.location.assign(redirectTo);
  }
};
