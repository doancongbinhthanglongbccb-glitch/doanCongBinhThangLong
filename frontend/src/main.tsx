import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./i18n";
import i18n from "./i18n";
import App from "./app";
import { initFrontendSentry } from "./lib/sentry";
import "./index.css";

initFrontendSentry();

createRoot(document.getElementById("root")!).render(
	<Sentry.ErrorBoundary fallback={<div>{i18n.t("errorBoundary.generic")}</div>}>
		<App />
	</Sentry.ErrorBoundary>,
);
