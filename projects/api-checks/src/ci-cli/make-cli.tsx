import React from 'react';
import { program as cli } from 'commander';
const packageJson = require('../../package.json');
import { ApiCheckService } from '../sdk/api-check-service';
import { registerUpload } from './commands/upload';
import { registerGithubComment } from './commands/comment';
import { registerBulkCompare, registerCompare } from './commands/compare';
import { initSentry } from './sentry';
import { initSegment } from './segment';

export function makeCiCli<T>(
  forProject: string,
  checkService: ApiCheckService<T>,
  options: {
    opticToken?: string;
  } = {}
) {
  initSentry(packageJson.version);
  initSegment();
  const { opticToken } = options;

  cli.version(
    `for ${forProject}, running optic api-check ${packageJson.version}`
  );

  registerCompare(cli, checkService);
  registerBulkCompare(cli, checkService);
  registerUpload(cli, { opticToken });
  registerGithubComment(cli);

  return cli;
}
