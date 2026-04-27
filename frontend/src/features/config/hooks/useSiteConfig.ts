import { useCallback, useMemo } from "react";
import { useConfig } from "./useConfig";
import { getByPath } from "../utils/getByPath";
import type { CmsData } from "../types/config.types";

export type UseSiteConfigResult = {
  /** Full resolved CMS config (null until loaded) */
  config: CmsData | null;
  /** Read nested config with dot path; returns `fallback` if missing. */
  get: <T = unknown>(path: string, fallback?: T) => T | undefined;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updateConfig: ReturnType<typeof useConfig>["updateConfig"];
  refetch: ReturnType<typeof useConfig>["refetch"];
};

export const useSiteConfig = (): UseSiteConfigResult => {
  const { config, isLoading, isSaving, error, updateConfig, refetch } = useConfig();

  const get = useCallback(
    <T,>(path: string, fallback?: T): T | undefined => {
      if (!config) {
        return fallback;
      }
      const v = getByPath(config, path);
      if (v === undefined || v === null) {
        return fallback;
      }
      return v as T;
    },
    [config],
  );

  return useMemo(
    () => ({
      config,
      get,
      isLoading,
      isSaving,
      error,
      updateConfig,
      refetch,
    }),
    [config, get, isLoading, isSaving, error, updateConfig, refetch],
  );
};
