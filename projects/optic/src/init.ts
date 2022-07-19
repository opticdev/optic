import { program as cli } from 'commander';
import { initSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { initSegment } from '@useoptic/openapi-utilities/build/utilities/segment';

import { registerCloudCompare } from '@useoptic/optic-ci/build/cli/commands/cloud-compare/cloud-compare';
import { registerInit } from '@useoptic/optic-ci/build/cli/commands/init/register-init';
import { registerCreateGithubContext } from '@useoptic/optic-ci/build/cli/commands/create-context/create-github-context';
import { registerDiff } from './commands/diff/diff';
import {
  DefaultOpticCliConfig,
  detectCliConfig,
  loadCliConfig,
  OpticCliConfig,
} from './config';
import path from 'path';

const packageJson = require('../package.json');

export const initCli = async () => {
  initSentry(packageJson.version);
  initSegment();

  let cliConfig: OpticCliConfig;
  const opticYmlPath = await detectCliConfig(process.cwd());
  if (!opticYmlPath) {
    cliConfig = DefaultOpticCliConfig;
  } else {
    cliConfig = await loadCliConfig(path.join(process.cwd(), 'optic.yml'));
  }

  cli.version(packageJson.version);

  registerCreateGithubContext(cli);
  registerCloudCompare(cli, false);
  registerInit(cli);
  registerDiff(cli, cliConfig);

  return cli;
};
