/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL?: string;
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_SENTRY_DSN?: string;
	readonly VITE_SENTRY_ENVIRONMENT?: string;
	readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
	readonly SENTRY_AUTH_TOKEN?: string;
	readonly SENTRY_ORG?: string;
	readonly SENTRY_PROJECT?: string;
}
