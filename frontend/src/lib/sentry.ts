import * as Sentry from "@sentry/react";
import { env } from "@/config/env";

export const initFrontendSentry = () => {
  if (!env.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    tracesSampleRate: env.VITE_SENTRY_TRACES_SAMPLE_RATE,
  });
};

export const captureFrontendException = (error: unknown) => {
  if (!env.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.captureException(error);
};