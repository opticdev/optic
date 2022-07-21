import { program as cli } from 'commander';
import { initSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import {
  flushEvents,
  initSegment,
  trackEvent,
} from '@useoptic/openapi-utilities/build/utilities/segment';

import { registerCreateGithubContext } from '@useoptic/optic-ci/build/cli/commands/create-context/create-github-context';
import { registerCreateManualContext } from '@useoptic/optic-ci/build/cli/commands/create-context/create-manual-context';
import { registerCloudCompare } from './commands/cloud-compare/cloud-compare';
import { registerInit } from './commands/init/register-init';
import { registerDiff } from './commands/diff/diff';
import {
  VCS,
  DefaultOpticCliConfig,
  detectCliConfig,
  loadCliConfig,
  OpticCliConfig,
} from './config';
import { hasGit, isInGitRepo, getRootPath } from './utils/git-utils';
import { machineId } from 'node-machine-id';

const packageJson = require('../package.json');

export const initCli = async () => {
  initSentry(process.env.SENTRY_URL, packageJson.version);
  initSegment(process.env.SEGMENT_KEY);
  cli.hook('preAction', async (command) => {
    const subcommands = ['cloud'];
    try {
      let commandName: string;
      let args: string[];
      if (subcommands.includes(command.args[0])) {
        commandName = command.args.slice(0, 2).join('.');
        args = command.args.slice(2);
      } else {
        [commandName, ...args] = command.args;
      }
      const anonymousId = await machineId();
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

  registerInit(cli, cliConfig);
  registerDiff(cli, cliConfig);

  const cloudSubcommands = cli
    .command('cloud')
    .description(
      'Commands to interact with Optic Cloud. See `optic cloud --help`'
    )
    .addHelpCommand(false);
  registerCloudCompare(cloudSubcommands, cliConfig);
  registerCreateGithubContext(cloudSubcommands, true);
  registerCreateManualContext(cloudSubcommands);

  return cli;
};
