#!/usr/bin/env node
import { initCli } from './init';

(async () => {
  const cli = await initCli();

  cli.parse(process.argv);
})();
