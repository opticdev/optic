import { program as cli } from 'commander';

import { registerUpdateCommand } from './commands/update';
import { registerDebugTemplateCommand } from './commands/debug-template';
import { debugWorkflowsCommand } from './commands/debug-workflows';
import { CliConfig } from './config';
const packageJson = require('../package.json');

export function makeCli(config: CliConfig) {
  cli.version(packageJson.version);

  registerUpdateCommand(cli); // TODO: apply a standalone Command instance instead
  registerDebugTemplateCommand(cli);

  cli.addCommand(debugWorkflowsCommand());

  return cli;
}
