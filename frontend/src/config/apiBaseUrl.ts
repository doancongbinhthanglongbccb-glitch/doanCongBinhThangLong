import { env } from "@/config/env";

const rawApiBase = (env.VITE_API_URL || env.VITE_API_BASE_URL || "").trim();

const normalizeBaseUrl = (value: string) => {
  if (!value) {
    return "";
  }

  if (value === "/") {
    return "";
  }

  return value.replace(/\/+$/, "");
};

export const API_BASE_URL = normalizeBaseUrl(rawApiBase);
