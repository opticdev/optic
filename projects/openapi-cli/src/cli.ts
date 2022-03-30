#!/usr/bin/env node

import { program as cli } from 'commander';

import { updateCommand } from './commands/update';
import { registerDebugTemplateCommand } from './commands/debug-template';
import { debugWorkflowsCommand } from './commands/debug-workflows';
import { CliConfig } from './config';
import { initSegment } from './segment';

const packageJson = require('../package.json');

export function makeCli(config: CliConfig) {
  cli.version(packageJson.version);

  cli.addCommand(updateCommand());
  registerDebugTemplateCommand(cli);

  cli.addCommand(debugWorkflowsCommand());

  return cli;
}

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
      segment: process.env.OPTIC_OPENCLI_SEGMENT_KEY
        ? {
            key: process.env.OPTIC_OPENCLI_SEGMENT_KEY,
          }
        : null,
    },
  };
}
