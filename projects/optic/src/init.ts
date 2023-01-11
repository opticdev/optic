import { program as cli } from 'commander';
import { initSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import {
  flushEvents,
  initSegment,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';

import { registerDiff } from './commands/diff/diff';
import { registerRulesetUpload } from './commands/ruleset/upload';

import { initializeConfig } from './config';
import { getAnonId } from './utils/anonymous-id';
import { registerRulesetInit } from './commands/ruleset/init';
import { registerApiAdd } from './commands/api/add';
import { captureCommand } from '@useoptic/openapi-cli/build/commands/capture';
import { newCommand } from '@useoptic/openapi-cli/build/commands/new';
import { captureCertCommand } from '@useoptic/openapi-cli/build/commands/capture-cert';
import { clearCommand } from '@useoptic/openapi-cli/build/commands/clear';
import { verifyCommand } from '@useoptic/openapi-cli/build/commands/verify';
import { registerDiffAll } from './commands/diff/diff-all';
import { registerSpecPush } from './commands/spec/push';
import { registerLogin } from './commands/login/login';

const packageJson = require('../package.json');

export const initCli = async () => {
  initSentry(process.env.SENTRY_URL, packageJson.version);
  initSegment(process.env.SEGMENT_KEY);
  cli.hook('preAction', async (command) => {
    const subcommands = ['ruleset'];
    try {
      let commandName: string;
      let args: string[];
      if (subcommands.includes(command.args[0])) {
        commandName = command.args.slice(0, 2).join('.');
        args = command.args.slice(2);
      } else {
        [commandName, ...args] = command.args;
      }
      const anonymousId = await getAnonId();
      trackEvent(`optic.${commandName}`, anonymousId, {
        args,
        isInCi: process.env.CI === 'true',
      });
      await flushEvents();
      // we can ignore non-critical tracking errors
    } catch (e) {}
  });

  const cliConfig = await initializeConfig();

  cli.version(packageJson.version);
  cli.addHelpCommand(false);

  registerDiff(cli, cliConfig);
  registerDiffAll(cli, cliConfig);
  registerLogin(cli, cliConfig);

  const rulesetSubcommands = cli
    .command('ruleset')
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

  const oas = cli.command('oas');
  oas.description(
    'generate OpenAPI operations and patches based on API traffic. See `optic oas --help`'
  );
  // commands for tracking changes with openapi
  oas.addCommand(await captureCommand());
  oas.addCommand(await newCommand());
  oas.addCommand(await captureCertCommand());
  oas.addCommand(await clearCommand());
  oas.addCommand(await verifyCommand());

  return cli;
};
