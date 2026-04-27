// Config feature pages/components
export { default as HeaderSettingsManager } from "./components/HeaderSettingsManager";
export { default as FooterSettingsManager } from "./components/FooterSettingsManager";
export { default as MenuManager } from "./components/MenuManager";
export { default as ConfigManagerPage } from "./pages/ConfigManagerPage";

// Hooks
export { useConfig } from "./hooks/useConfig";
export { useSiteConfig } from "./hooks/useSiteConfig";
export { getByPath } from "./utils/getByPath";

// Services
export * as configService from "./services/config.service";

// Types
export type { CmsData, ConfigUpdatePayload, CmsCollectionKey } from "./types/config.types";
