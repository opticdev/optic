import * as Sentry from '@sentry/node';

export function trackWithSentry({
  dsn,
  serverName,
  environment,
  release,
}: {
  dsn: string | undefined;
  serverName: string;
  environment: string;
  release: string;
}) {
  if (!dsn)
    throw new Error(`Sentry DSN must be set to track errors for ${serverName}`);

  Sentry.init({
    dsn,
    serverName,
    environment,
    release,
    tracesSampleRate: 1.0,
  });
}
