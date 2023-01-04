import { Command } from 'commander';
import fs from 'fs-extra';
import Path from 'path';
import { randomUUID } from 'crypto';
import { createCommandFeedback } from './commands/reporters/feedback';

import { captureCommand } from './commands/capture';
import { newCommand } from './commands/new';
import { verifyCommand } from './commands/verify';
import { CliConfig, readConfig } from './config';
import { initSegment, trackEvent } from './segment';
import { initSentry } from './sentry';
import { clearCommand } from './commands/clear';
import { captureCertCommand } from './commands/capture-cert';

export async function makeCli(config: CliConfig) {
  const cli = new Command('oas');

  cli.version(config.package.version);
  cli.description('oas [openapi-file] <command> [options]');

  cli.addCommand(await captureCommand());
  cli.addCommand(await newCommand());
  cli.addCommand(await captureCertCommand());
  cli.addCommand(await clearCommand());
  cli.addCommand(await verifyCommand());
  // registerDebugTemplateCommand(cli);
  // cli.addCommand(debugWorkflowsCommand());

  return cli;
}

export async function runCli(packageManifest?: {
  name: string;
  version: string;
}) {
  const updateNotifier = (await import('update-notifier')).default;
  const config = readConfig(packageManifest);

  updateNotifier({
    pkg: config.package,
    distTag: config.updateNotifier.distTag,
  }).notify();

  const runId = randomUUID();
  if (config.analytics.segment) {
    initSegment({
      ...config.analytics.segment,
      version: config.package.version,
      name: config.package.name,
      runId,
    });
  }

  if (config.errors.sentry) {
    initSentry({
      ...config.errors.sentry,
      version: config.package.version,
      runId,
    });
  }

  const cli = await makeCli(config);
  const feedback = createCommandFeedback(cli);
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

    if (!subcommand) {
      feedback.instruction(
        'provide a command to use with the provided spec file\n'
      );
      subcommand = '--help';
    }

    args[0] = subcommand;
    args[1] = specPath;
  }

  trackEvent('openapi-cli-run', {
    runId,
    version: config.package.version,
  });

  cli.parse(args, { from: 'user' });
}
