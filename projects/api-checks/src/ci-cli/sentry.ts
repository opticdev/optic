import * as Sentry from '@sentry/node';

export let SentryClient: Sentry.NodeClient | null = null;

export const initSentry = (version: string) => {
  // TODO disable this when we are running this locally, vs building this

  SentryClient = new Sentry.NodeClient({
    dsn: 'https://0937132c53034bc0bf7f88428c3bff22@o446328.ingest.sentry.io/6089645',
    tracesSampleRate: 1.0,
    release: version,
  })
};

export const wrapActionHandlerWithSentry = <Fn extends (...args: any) => any>(
  fn: Fn
): Fn => {
  try {
    return fn;
  } catch (e) {
    SentryClient && SentryClient.captureException(e);
    throw e;
  }
};
