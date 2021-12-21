import * as Sentry from '@sentry/node';

export let SentryClient: Sentry.NodeClient | null = null;

export const initSentry = (version: string) => {
  // TODO disable this when we are running this locally, vs building this

  SentryClient = new Sentry.NodeClient({
    dsn:
      'https://0937132c53034bc0bf7f88428c3bff22@o446328.ingest.sentry.io/6089645',
    tracesSampleRate: 1.0,
    release: version,
  });
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
      if (SentryClient && err.name !== 'UserError') {
        SentryClient.captureException(e);
        await SentryClient.flush();
      }
      process.exit(1);
    }
  };
};
