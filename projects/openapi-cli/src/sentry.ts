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

export function trackWarning(
  message: string,
  context?: { [key: string]: any }
) {
  Sentry.withScope(function (scope) {
    if (context) {
      scope.setContext('warning context', context);
    }
    Sentry.captureMessage(message, 'warning');
  });
}
