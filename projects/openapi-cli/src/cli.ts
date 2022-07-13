#!/usr/bin/env node

import { program as cli } from 'commander';

import { addCommand } from './commands/add';
import { captureCommand } from './commands/capture';
import { statusCommand } from './commands/status';
import { updateCommand } from './commands/update';
import { registerDebugTemplateCommand } from './commands/debug-template';
import { debugWorkflowsCommand } from './commands/debug-workflows';
import { CliConfig, readConfig } from './config';
import { initSegment, trackEvent } from './segment';
import { initSentry } from './sentry';

const packageJson = require('../package.json');

export function makeCli(config: CliConfig) {
  cli.version(packageJson.version);

  cli.addCommand(addCommand());
  cli.addCommand(captureCommand());
  cli.addCommand(statusCommand());
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

  if (config.errors.sentry) {
    initSentry({ ...config.errors.sentry, version: packageJson.version });
  }

  trackEvent('openapi-cli-run', 'openapi-cli', {
    version: packageJson.version,
  });

  const cli = makeCli(config);

  cli.parse(process.argv);
})();
