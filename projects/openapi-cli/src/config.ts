export interface CliConfig {
  analytics: {
    segment: null | {
      key: string;
    };
  };
  errors: {
    sentry: null | {
      dsn: string;
    };
  };
}

export function readConfig(): CliConfig {
  return {
    analytics: {
      segment: process.env.OPTIC_OPENCLI_SEGMENT_KEY
        ? {
            key: process.env.OPTIC_OPENCLI_SEGMENT_KEY,
          }
        : null,
    },
    errors: {
      sentry: process.env.OPTIC_OPENCLI_SENTRY_DSN
        ? {
            dsn: process.env.OPTIC_OPENCLI_SENTRY_DSN,
          }
        : null,
    },
  };
}
