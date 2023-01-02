import { program as cli } from 'commander';
import { initSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import {
  flushEvents,
  initSegment,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';

import { registerDiff } from './commands/diff/diff';
import { registerRulesetUpload } from './commands/ruleset/upload';

import {
  VCS,
  DefaultOpticCliConfig,
  detectCliConfig,
  loadCliConfig,
  OpticCliConfig,
} from './config';
import { hasGit, isInGitRepo, getRootPath } from './utils/git-utils';
import { getAnonId } from './utils/anonymous-id';
import { registerRulesetInit } from './commands/ruleset/init';
import { captureCommand } from '@useoptic/openapi-cli/build/commands/capture';
import { newCommand } from '@useoptic/openapi-cli/build/commands/new';
import { captureCertCommand } from '@useoptic/openapi-cli/build/commands/capture-cert';
import { clearCommand } from '@useoptic/openapi-cli/build/commands/clear';
import { verifyCommand } from '@useoptic/openapi-cli/build/commands/verify';

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
      });
      await flushEvents();
      // we can ignore non-critical tracking errors
    } catch (e) {}
  });

  let cliConfig: OpticCliConfig = DefaultOpticCliConfig;
  if ((await hasGit()) && (await isInGitRepo())) {
    const gitRoot = await getRootPath();
    const opticYmlPath = await detectCliConfig(gitRoot);

    if (opticYmlPath) {
      cliConfig = await loadCliConfig(opticYmlPath);
    }

    cliConfig.vcs = VCS.Git;
  }

  cli.version(packageJson.version);
  cli.addHelpCommand(false);

  registerDiff(cli, cliConfig);

  const rulesetSubcommands = cli
    .command('ruleset')
    .description(
      'Commands to build your own optic rulesets. See `optic ruleset --help`'
    )
    .addHelpCommand(false);
  registerRulesetUpload(rulesetSubcommands, cliConfig);
  registerRulesetInit(rulesetSubcommands, cliConfig);

  // commands for tracking changes with openapi
  cli.addCommand(await captureCommand());
  cli.addCommand(await newCommand());
  cli.addCommand(await captureCertCommand());
  cli.addCommand(await clearCommand());
  cli.addCommand(await verifyCommand());

  return cli;
};
