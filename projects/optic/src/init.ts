import { program as cli } from 'commander';
import { initSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { initSegment } from '@useoptic/openapi-utilities/build/utilities/segment';

import { registerCloudCompare } from '@useoptic/optic-ci/build/cli/commands/cloud-compare/cloud-compare';
import { registerInit } from '@useoptic/optic-ci/build/cli/commands/init/register-init';
import { registerCreateGithubContext } from '@useoptic/optic-ci/build/cli/commands/create-context/create-github-context';
import { registerCreateManualContext } from '@useoptic/optic-ci/build/cli/commands/create-context/create-manual-context';
import { registerDiff } from './commands/diff/diff';
import {
  DefaultOpticCliConfig,
  detectCliConfig,
  loadCliConfig,
  OpticCliConfig,
} from './config';
import path from 'path';
import {
  hasGit,
  isInGitRepo,
  getRootPath,
} from '@useoptic/optic-ci/build/cli/commands/init/git-utils';

const packageJson = require('../package.json');

export const initCli = async () => {
  initSentry(packageJson.version);
  initSegment();

  let cliConfig: OpticCliConfig = DefaultOpticCliConfig;
  if ((await hasGit()) && (await isInGitRepo())) {
    const gitRoot = await getRootPath();
    const opticYmlPath = await detectCliConfig(gitRoot);

    if (opticYmlPath) {
      cliConfig = await loadCliConfig(opticYmlPath);
    }

    cliConfig.vcs = 'git';
  }
  console.log(cliConfig);

  cli.version(packageJson.version);
  cli.addHelpCommand(false);

  registerInit(cli);
  registerDiff(cli, cliConfig);

  const cloudSubcommands = cli
    .command('cloud')
    .description(
      'Commands to interact with Optic Cloud. See `optic cloud --help`'
    )
    .addHelpCommand(false);
  registerCloudCompare(cloudSubcommands, false);
  registerCreateGithubContext(cloudSubcommands, true);
  registerCreateManualContext(cloudSubcommands);

  return cli;
};
