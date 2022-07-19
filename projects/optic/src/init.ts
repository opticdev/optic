import { program as cli } from 'commander';
import { initSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { initSegment } from '@useoptic/openapi-utilities/build/utilities/segment';

import { registerCloudCompare } from '@useoptic/optic-ci/build/cli/commands/cloud-compare/cloud-compare';
import { registerInit } from '@useoptic/optic-ci/build/cli/commands/init/register-init';
import { registerCreateGithubContext } from '@useoptic/optic-ci/build/cli/commands/create-context/create-github-context';
import { registerCreateManualContext } from '@useoptic/optic-ci/build/cli/commands/create-context/create-manual-context';
import { registerDiff } from './commands/diff/diff';

const packageJson = require('../package.json');

export const initCli = async () => {
  initSentry(packageJson.version);
  initSegment();
  cli.version(packageJson.version);
  cli.addHelpCommand(false);

  registerInit(cli);
  registerDiff(cli);

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
