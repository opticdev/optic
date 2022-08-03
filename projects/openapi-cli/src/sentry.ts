import * as Sentry from '@sentry/node';

export const initSentry = ({
  dsn,
  runId,
  version,
}: {
  dsn: string;
  runId: string;
  version: string;
}) => {
  Sentry.init({
    dsn,
    tracesSampleRate: 1.0,
    release: version,
  });

  Sentry.setTag('runId', runId);
};
