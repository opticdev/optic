import { program as cli } from 'commander';

import { registerUpdateCommand } from './commands/update';
import { registerDebugPluginCommand } from './commands/debug-plugin';
import { CliConfig } from './config';
const packageJson = require('../package.json');

export function makeCli(config: CliConfig) {
  cli.version(packageJson.version);

  registerUpdateCommand(cli);
  registerDebugPluginCommand(cli);

  return cli;
}
