import { program as cli } from 'commander';

import { registerUpdateCommand } from './commands/update';
import { registerDebugTemplateCommand } from './commands/debug-template';
import { CliConfig } from './config';
const packageJson = require('../package.json');

export function makeCli(config: CliConfig) {
  cli.version(packageJson.version);

  registerUpdateCommand(cli);
  registerDebugTemplateCommand(cli);

  return cli;
}
