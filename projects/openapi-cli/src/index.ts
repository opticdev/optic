#!/usr/bin/env node

import { makeCli } from './cli';
import { CliConfig } from './config';

(async () => {
  const config = await readConfig();

  const cli = makeCli(config);

  cli.parse(process.argv);
})();

async function readConfig(): Promise<CliConfig> {
  return {};
}
