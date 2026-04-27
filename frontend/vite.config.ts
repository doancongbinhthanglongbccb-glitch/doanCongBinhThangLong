import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { loadEnv } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Use a stable dev port (3000) to match docker-compose.dev.yml.
  // Can be overridden via CLI flags or by setting VITE_PROXY_TARGET for Docker.
  build: (() => {
    const env = loadEnv(mode, process.cwd(), "");
    const canUploadSourcemaps = mode === "production" && env.SENTRY_AUTH_TOKEN && env.SENTRY_ORG && env.SENTRY_PROJECT;

    return {
      sourcemap: Boolean(canUploadSourcemaps),
    };
  })(),
  server: {
    // Default dev port: 3000
    host: "::",
    port: 3000,
    allowedHosts: ["suds-dial-bruising.ngrok-free.dev", "localhost", "127.0.0.1"],
    proxy: {
      "/api": {
        // When running in Docker, override via `VITE_PROXY_TARGET=http://backend:8000`.
        target: loadEnv(mode, process.cwd(), "").VITE_PROXY_TARGET || "http://localhost:8000",
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: (() => {
    const env = loadEnv(mode, process.cwd(), "");
    const sentryPlugin =
      mode === "production" && env.SENTRY_AUTH_TOKEN && env.SENTRY_ORG && env.SENTRY_PROJECT
        ? sentryVitePlugin({
            authToken: env.SENTRY_AUTH_TOKEN,
            org: env.SENTRY_ORG,
            project: env.SENTRY_PROJECT,
          })
        : null;

    return [react(), mode === "development" && componentTagger(), sentryPlugin].filter(Boolean);
  })(),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
