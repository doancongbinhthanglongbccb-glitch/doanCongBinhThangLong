import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import { initFrontendSentry } from "./lib/sentry";
import "./index.css";

initFrontendSentry();

createRoot(document.getElementById("root")!).render(
	<Sentry.ErrorBoundary fallback={<div>Something went wrong. Please reload the page.</div>}>
		<App />
	</Sentry.ErrorBoundary>,
);
