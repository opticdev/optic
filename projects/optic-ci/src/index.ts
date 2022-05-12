#!/usr/bin/env node

import { readConfig } from './config';
import { initializeCli } from './initialize';

(async () => {
  const config = await readConfig();
  const cli = await initializeCli(config);

  cli.parse(process.argv);
})();
