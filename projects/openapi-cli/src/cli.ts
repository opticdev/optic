import { program as cli } from 'commander';

import { CliConfig } from './config';

export function makeCli(config: CliConfig) {
  return cli;
}
