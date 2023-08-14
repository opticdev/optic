import * as Sentry from '@sentry/node';
import { UserError } from '@useoptic/openapi-utilities';

export { Sentry as SentryClient };

export const initSentry = (sentryUrl: string | undefined, version: string) => {
  const disableTelemetry = process.env.OPTIC_TELEMETRY_LEVEL === 'off';
  const opticEnvNotProd =
    process.env.OPTIC_ENV === 'staging' || process.env.OPTIC_ENV === 'local';
  const isSentryDisabled = disableTelemetry || opticEnvNotProd;
  if (sentryUrl && !isSentryDisabled) {
    Sentry.init({
      dsn: sentryUrl,
      integrations: (integrations) => {
        // Disable the Sentry Http integration, we don't use traces across http bounds and this breaks certain cases with capture
        // as it adds custom sentry http headers
        return integrations.filter(
          (integration) => integration.name !== 'Http'
        );
      },
      release: version,
    });
  }
};

export const wrapActionHandlerWithSentry = <
  Args extends any[],
  Return extends any,
>(
  fn: (...args: Args) => Promise<Return>
): ((...args: Args) => Promise<Return>) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      const err = e as Error;
      console.error(err.message);
      if (!UserError.isInstance(e)) {
        Sentry.captureException(e);
      }
      await Sentry.flush();
      process.exit(1);
    }
  };
};
