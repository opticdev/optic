export interface CliConfig {
  analytics: {
    segment: null | {
      key: string;
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
  };
}
