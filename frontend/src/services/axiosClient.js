import axios from "axios";
import { API_BASE_URL } from "@/config/apiBaseUrl";
import { ApiEndpoints } from "@/services/api/endpoints";
import {
  clearTokens,
  getAccessToken,
  setAuthUser,
  setTokens,
} from "@/features/auth/services/auth.service";
import { ROUTES } from "@/lib/constants";

const clearTokenAndRedirectToLogin = () => {
  clearTokens();

  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname === ROUTES.LOGIN) {
    return;
  }

  const redirectTarget = `${window.location.pathname}${window.location.search}`;
  const redirectQuery = encodeURIComponent(redirectTarget);
  window.location.assign(`${ROUTES.LOGIN}?redirect=${redirectQuery}`);
};

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
        // Use bare axios here to avoid interceptor recursion while refreshing.
        const { data } = await axios.post(`${API_BASE_URL}${ApiEndpoints.authRefresh}`, {}, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const nextAccessToken = data?.accessToken;
        if (!nextAccessToken) {
          throw new Error("Refresh response does not contain accessToken");
        }

        setTokens({ accessToken: nextAccessToken });
        if (data?.user) {
          setAuthUser(data.user);
        }
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
