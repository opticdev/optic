import React from 'react';
import { program as cli } from 'commander';
import { registerBaselineCommands } from './commands/baseline';
const packageJson = require('../../package.json');

cli.version(packageJson.version);

// register commands
registerBaselineCommands(cli);

cli.parse(process.argv);
