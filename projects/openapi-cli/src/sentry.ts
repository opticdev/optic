import { SentryClient } from '@useoptic/openapi-utilities/build/utilities/sentry';

export function trackWarning(
  message: string,
  context?: { [key: string]: any }
) {
  SentryClient.withScope(function (scope) {
    if (context) {
      scope.setContext('warning context', context);
    }
    SentryClient.captureMessage(message, 'warning');
  });
}
