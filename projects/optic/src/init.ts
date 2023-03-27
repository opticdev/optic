import { Command, program as cli } from 'commander';
import updateNotifier from 'update-notifier';
import { initSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import {
  flushEvents,
  initSegment,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';

import { registerDiff } from './commands/diff/diff';
import { registerRulesetUpload } from './commands/ruleset/upload';

import { initializeConfig } from './config';
import { registerRulesetInit } from './commands/ruleset/init';
import { registerApiAdd } from './commands/api/add';
import { captureCommand } from './commands/oas/capture';
import { newCommand } from './commands/oas/new';
import { setupTlsCommand } from './commands/oas/setup-tls';
import { verifyCommand } from './commands/oas/verify';
import { registerDiffAll } from './commands/diff/diff-all';
import { registerSpecPush } from './commands/spec/push';
import { registerLogin } from './commands/login/login';
import { registerCiComment } from './commands/ci/comment/comment';
import { logger } from './logger';
import chalk from 'chalk';
import { registerDereference } from './commands/dereference/dereference';
import { registerCiSetup } from './commands/ci/setup';
import { registerLint } from './commands/lint/lint';
import { updateCommand } from './commands/oas/update';

const packageJson = require('../package.json');

export const initCli = async () => {
  initSentry(process.env.SENTRY_URL, packageJson.version);
  initSegment(process.env.SEGMENT_KEY);
  cli.hook('preAction', async (command) => {
    const subcommands = ['ruleset', 'oas', 'api', 'spec', 'ci'];
    let commandName: string;
    let args: string[];
    if (subcommands.includes(command.args[0])) {
      commandName = command.args.slice(0, 2).join('.');
      args = command.args.slice(2);
    } else {
      [commandName, ...args] = command.args;
    }
    trackEvent(`optic.${commandName}`, {
      args,
      isInCi: process.env.CI === 'true',
    });
    trackEvent(`optic.cli`, {
      commandName,
      args,
      isInCi: process.env.CI === 'true',
    });
  });

  const notifier = updateNotifier({
    pkg: {
      name: packageJson.name,
      version: packageJson.version,
    },
  });

  cli.hook('postAction', async () => {
    if (notifier.update) {
      logger.info(
        `
${chalk.green(chalk.bold(`New Optic version available:`))} ${
          notifier.update.latest
        } (current ${notifier.update.current})

Run ${chalk.yellow('npm i -g @useoptic/optic')} to upgrade Optic`
      );
    }
    try {
      await flushEvents();
      // we can ignore non-critical tracking errors
    } catch (e) {}
  });

  const cliConfig = await initializeConfig();

  cli.version(packageJson.version);
  cli.addHelpCommand(false);

  registerDiff(cli, cliConfig);

  //@todo by 2023/5/10
  cli.addCommand(
    new Command('oas')
      .description('[Renamed] to optic capture/new/verify/update')
      .action(() =>
        console.log(
          `[Renamed] to optic capture/new/verify/update. See ${chalk.blue.underline(
            'https://www.useoptic.com/docs/openapi/update-from-traffic'
          )}`
        )
      )
  );

  // commands for tracking changes with openapi
  cli.addCommand(await captureCommand(cliConfig));
  cli.addCommand(await newCommand());
  cli.addCommand(await setupTlsCommand());
  cli.addCommand(verifyCommand(cliConfig));
  cli.addCommand(updateCommand());

  registerLint(cli, cliConfig);
  registerDiffAll(cli, cliConfig);
  registerLogin(cli, cliConfig);
  registerDereference(cli, cliConfig);

  const rulesetSubcommands = cli
    .command('ruleset', { hidden: true })
    .description(
      'Commands to build your own optic rulesets. See `optic ruleset --help`'
    )
    .addHelpCommand(false);
  registerRulesetUpload(rulesetSubcommands, cliConfig);
  registerRulesetInit(rulesetSubcommands, cliConfig);

  const apiSubcommands = cli.command('api').addHelpCommand(false);
  registerApiAdd(apiSubcommands, cliConfig);

  const specSubcommands = cli.command('spec').addHelpCommand(false);
  registerSpecPush(specSubcommands, cliConfig);

  const ciSubcommands = cli.command('ci').addHelpCommand(false);
  registerCiComment(ciSubcommands, cliConfig);
  registerCiSetup(ciSubcommands, cliConfig);

  return cli;
};
