#!/usr/bin/env node

import { makeCli } from './cli';
import { CliConfig } from './config';
import { initSegment } from './segment';

(async () => {
  const config = await readConfig();

  if (config.analytics.segment) {
    initSegment(config.analytics.segment);
  }

  const cli = makeCli(config);

  cli.parse(process.argv);
})();

async function readConfig(): Promise<CliConfig> {
  return {
    analytics: {
      segment: process.env.SEGMENT_KEY
        ? {
            key: process.env.SEGMENT_KEY,
          }
        : null,
    },
  };
}
