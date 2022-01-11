import { program as cli } from 'commander';
import { ApiCheckService } from '../sdk/api-check-service';
import { registerUpload, registerBulkUpload } from './commands/upload';
import {
  registerGithubComment,
  registerBulkGithubComment,
} from './commands/comment';
import { registerBulkCompare, registerCompare } from './commands/compare';
import { initSentry } from './sentry';
import { initSegment } from './segment';
import { OpticCINamedRulesets } from '../sdk/ruleset';
const packageJson = require('../../package.json');

export function makeCiCliWithNamedRules(
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
  registerBulkUpload(cli, { opticToken });
  registerGithubComment(cli);
  registerBulkGithubComment(cli);

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
