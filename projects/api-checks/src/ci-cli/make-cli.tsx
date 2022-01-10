import React from 'react';
import { program as cli } from 'commander';
const packageJson = require('../../package.json');
import { ApiCheckService } from '../sdk/api-check-service';
import { registerUpload } from './commands/upload';
import { registerGithubComment } from './commands/comment';
import { registerBulkCompare, registerCompare } from './commands/compare';
import { initSentry } from './sentry';
import { initSegment } from './segment';
import { OpticCINamedRulesets } from '../sdk/ruleset';

export function makeCiCliWithNamedRules<T>(
  forProject: string,
  rulesetServices: OpticCINamedRulesets,
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

  registerCompare(cli, forProject, rulesetServices);
  registerBulkCompare(cli, forProject, rulesetServices);
  registerUpload(cli, { opticToken });
  registerGithubComment(cli);

  return cli;
}

export function makeCiCli<T>(
  forProject: string,
  checkService: ApiCheckService<T>,
  options: {
    opticToken?: string;
  } = {}
) {
  return makeCiCliWithNamedRules(
    forProject,
    { default: checkService },
    options
  );
}
