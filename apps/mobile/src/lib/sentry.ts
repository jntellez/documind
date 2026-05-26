import * as Sentry from "@sentry/react-native";

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
const isTestEnvironment = Boolean(process.env.JEST_WORKER_ID);
let isSentryInitialized = false;

export function initSentry() {
  if (isSentryInitialized || isTestEnvironment || !sentryDsn) {
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    enabled: true,
    debug: __DEV__,
  });

  isSentryInitialized = true;
}

export { Sentry };
