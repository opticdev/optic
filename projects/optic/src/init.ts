import { program as cli } from 'commander';
import { initSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { initSegment } from '@useoptic/openapi-utilities/build/utilities/segment';

const packageJson = require('../../package.json');

export const initCli = async () => {
  initSentry(packageJson.version);
  initSegment();
  cli.version(packageJson.version);

  // TODO copy over commands

  return cli;
};
