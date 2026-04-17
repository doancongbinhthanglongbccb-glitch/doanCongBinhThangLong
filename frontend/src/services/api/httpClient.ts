import axiosClient from "@/services/axiosClient";

const DEFAULT_TIMEOUT_MS = 10000;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = "GET", body, headers = {}, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const response = await axiosClient.request<T>({
    url: path,
    method,
    data: body,
    headers,
    timeout: timeoutMs,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  return response.data as T;
};
