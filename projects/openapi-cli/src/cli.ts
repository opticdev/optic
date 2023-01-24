import { Command } from 'commander';
import fs from 'fs-extra';
import Path from 'path';
import { randomUUID } from 'crypto';
import { createCommandFeedback } from './commands/reporters/feedback';

import { captureCommand } from './commands/capture';
import { newCommand } from './commands/new';
import { verifyCommand } from './commands/verify';
import { CliConfig, readConfig } from './config';
import { trackEvent } from './segment';
import { clearCommand } from './commands/clear';
import { setupTlsCommand } from './commands/setup-tls';

export async function makeCli(config: CliConfig) {
  const cli = new Command('oas');

  cli.version(config.package.version);
  cli.description('oas [openapi-file] <command> [options]');

  cli.addCommand(await captureCommand());
  cli.addCommand(await newCommand());
  cli.addCommand(await setupTlsCommand());
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

  // console.log('oas commands are now part of the optic cli');
  // console.log(
  //   'Updated documented is at: http://useoptic.com/docs/document-existing-api\n\n'
  // );

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
    version: config.package.version,
  });

  cli.parse(args, { from: 'user' });
}
