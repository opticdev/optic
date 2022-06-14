#!/usr/bin/env node

import { program as cli } from 'commander';

import { updateCommand } from './commands/update';
import { registerDebugTemplateCommand } from './commands/debug-template';
import { debugWorkflowsCommand } from './commands/debug-workflows';
import { CliConfig, readConfig } from './config';
import { initSegment, trackEvent } from './segment';

const packageJson = require('../package.json');

export function makeCli(config: CliConfig) {
  cli.version(packageJson.version);

  cli.addCommand(updateCommand());
  registerDebugTemplateCommand(cli);

  cli.addCommand(debugWorkflowsCommand());

  return cli;
}

(async () => {
  const config = readConfig();

  if (config.analytics.segment) {
    initSegment(config.analytics.segment);
  }
  trackEvent('openapi-cli-run', 'openapi-cli', {
    version: packageJson.version,
  });

  const cli = makeCli(config);

  cli.parse(process.argv);
})();
