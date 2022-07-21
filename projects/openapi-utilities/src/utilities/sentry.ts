import * as Sentry from '@sentry/node';
import { UserError } from '../errors';

export let SentryClient: Sentry.NodeClient | null = null;

export const initSentry = (sentryUrl: string | undefined, version: string) => {
  if (sentryUrl) {
    SentryClient = new Sentry.NodeClient({
      dsn: sentryUrl,
      tracesSampleRate: 1.0,
      release: version,
    });
  }
};

export const wrapActionHandlerWithSentry = <
  Args extends any[],
  Return extends any
>(
  fn: (...args: Args) => Promise<Return>
): ((...args: Args) => Promise<Return>) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      const err = e as Error;
      console.error(err.message);
      if (SentryClient && !UserError.isInstance(e)) {
        SentryClient.captureException(e);
      }
      if (SentryClient) {
        await SentryClient.flush();
      }
      process.exit(1);
    }
  };
};
