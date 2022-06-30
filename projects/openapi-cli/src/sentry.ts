import * as Sentry from '@sentry/node';

export const initSentry = ({
  dsn,
  version,
}: {
  dsn: string;
  version: string;
}) => {
  Sentry.init({ dsn, tracesSampleRate: 1.0, release: version });
};
