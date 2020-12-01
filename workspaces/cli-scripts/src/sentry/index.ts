import * as Sentry from '@sentry/node';

export interface ICliServerSentryWrapper {
  init(): void;
}

class CliServerSentryWrapper implements ICliServerSentryWrapper {
  init() {
    Sentry.init({
      dsn: process.env.OPTIC__CLI_SCRIPTS__SENTRY__DSN,
      serverName: 'optic-cli-scripts',
      environment:
        process.env.OPTIC__CLI_SCRIPTS__SENTRY__ENVIRONMENT || 'local',
      release: process.env.OPTIC__NPM__VERSION || 'local',
      tracesSampleRate: 1.0,
    });
    console.log('Sentry is enabled');
  }
}

class NullSentryWrapper implements ICliServerSentryWrapper {
  init() {
    console.warn('Sentry is not enabled');
  }
}

export function getSentryWrapper(): ICliServerSentryWrapper {
  if (process.env.OPTIC__CLI_SCRIPTS__SENTRY__ENABLED === 'yes') {
    return new CliServerSentryWrapper();
  } else {
    return new NullSentryWrapper();
  }
}
