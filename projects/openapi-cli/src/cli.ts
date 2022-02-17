import { program as cli } from 'commander';

import { registerUpdateCommand } from './update';
import { CliConfig } from './config';
const packageJson = require('../package.json');

export function makeCli(config: CliConfig) {
  cli.version(packageJson.version);

  registerUpdateCommand(cli);

  return cli;
}
