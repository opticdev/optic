#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import Path from 'path';

import { addCommand } from './commands/add';
import { captureCommand } from './commands/capture';
import { newCommand } from './commands/new';
import { statusCommand } from './commands/status';
import { updateCommand } from './commands/update';
import { registerDebugTemplateCommand } from './commands/debug-template';
import { debugWorkflowsCommand } from './commands/debug-workflows';
import { CliConfig, readConfig } from './config';
import { initSegment, trackEvent } from './segment';
import { initSentry } from './sentry';

const packageJson = require('../package.json');

export function makeCli(config: CliConfig) {
  const cli = new Command('oas');

  cli.version(packageJson.version);
  cli.description('oas [openapi-file] <command> [options]');

  cli.addCommand(addCommand());
  cli.addCommand(captureCommand());
  cli.addCommand(newCommand());
  cli.addCommand(statusCommand());
  cli.addCommand(updateCommand());

  // registerDebugTemplateCommand(cli);
  // cli.addCommand(debugWorkflowsCommand());

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

  const cli = await makeCli(config);
  const subCommandNames = cli.commands.flatMap((cmd) => [
    cmd.name(),
    ...cmd.aliases(),
  ]);

  const args = process.argv.slice(2);

  if (
    args[0] &&
    !subCommandNames.includes(args[0]) &&
    ((args[1] && subCommandNames.includes(args[1])) ||
      (await fs.pathExists(Path.resolve(args[0]))))
  ) {
    let subcommand = args[1];
    let specPath = args[0];

    args[0] = subcommand;
    args[1] = specPath;
  }

  cli.parse(args, { from: 'user' });
})();
