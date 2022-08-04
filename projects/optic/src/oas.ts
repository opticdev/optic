#!/usr/bin/env node
import { runCli } from '@useoptic/openapi-cli/build/cli';
const packageJson = require('../package.json');

(async function () {
  await runCli(packageJson);
})();
