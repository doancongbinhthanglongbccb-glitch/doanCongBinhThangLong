import axios from "axios";
import { ApiEndpoints } from "@/services/api/endpoints";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/services/auth";

const LOGIN_PATH = "/login";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const clearTokenAndRedirectToLogin = () => {
  clearTokens();

  if (!canUseStorage()) {
    return;
  }

  if (window.location.pathname === LOGIN_PATH) {
    return;
  }

  const redirectTarget = `${window.location.pathname}${window.location.search}`;
  const redirectQuery = encodeURIComponent(redirectTarget);
  window.location.assign(`${LOGIN_PATH}?redirect=${redirectQuery}`);
};

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config || {};
    const requestUrl = originalRequest?.url || "";
    const isRefreshRequest = requestUrl.includes(ApiEndpoints.authRefresh);

    if (status === 401 && !isRefreshRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("Refresh token is missing");
        }

        // Use bare axios here to avoid interceptor recursion while refreshing.
        const { data } = await axios.post(`${API_BASE_URL}${ApiEndpoints.authRefresh}`, { refreshToken }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const nextAccessToken = data?.accessToken;
        if (!nextAccessToken) {
          throw new Error("Refresh response does not contain accessToken");
        }

        setTokens({ accessToken: nextAccessToken });
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return axiosClient(originalRequest);
      } catch {
        clearTokenAndRedirectToLogin();
        return Promise.reject(error);
      }
    }

    if (status === 401) {
      clearTokenAndRedirectToLogin();
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
