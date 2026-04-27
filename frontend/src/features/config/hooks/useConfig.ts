import { useCallback, useEffect, useState } from "react";
import * as configService from "../services/config.service";
import type { CmsData, ConfigUpdatePayload } from "../types/config.types";

type UseConfigResult = {
  config: CmsData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  updateConfig: (updater: ConfigUpdatePayload | ((prev: CmsData) => ConfigUpdatePayload)) => Promise<CmsData>;
  refetch: () => Promise<void>;
};

export const useConfig = (): UseConfigResult => {
  const [config, setConfig] = useState<CmsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await configService.getConfig();
      setConfig(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load config";
      setError(message);
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateConfig = useCallback(
    async (
      updater: ConfigUpdatePayload | ((prev: CmsData) => ConfigUpdatePayload)
    ): Promise<CmsData> => {
      if (!config) {
        throw new Error("Config not loaded");
      }

      try {
        setIsSaving(true);
        setError(null);
        const updated = await configService.updateConfig(updater);
        setConfig(updated);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update config";
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [config]
  );

  const refetch = useCallback(async () => {
    await fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    isLoading,
    isSaving,
    error,
    updateConfig,
    refetch,
  };
};
