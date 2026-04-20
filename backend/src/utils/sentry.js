let sentrySdk = null;
let sentryEnabled = false;

const loadSentrySdk = () => {
  if (sentrySdk !== null) {
    return sentrySdk;
  }

  try {
    // Keep Sentry optional so local installs without the SDK still start.
    // eslint-disable-next-line global-require
    sentrySdk = require("@sentry/node");
  } catch {
    sentrySdk = false;
  }

  return sentrySdk;
};

const initSentry = (env) => {
  const sdk = loadSentrySdk();
  if (!sdk || !env?.SENTRY_DSN) {
    sentryEnabled = false;
    return;
  }

  sdk.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || env.NODE_ENV,
    tracesSampleRate: env.SENTRY_TRACES_SAMPLE_RATE,
    sendDefaultPii: false,
  });

  sentryEnabled = true;
};

const captureException = (error, context = {}) => {
  const sdk = loadSentrySdk();

  if (!sdk || !sentryEnabled) {
    return;
  }

  sdk.withScope((scope) => {
    if (context.tags) {
      scope.setTags(context.tags);
    }

    if (context.user) {
      scope.setUser(context.user);
    }

    sdk.captureException(error);
  });
};

module.exports = {
  initSentry,
  captureException,
};