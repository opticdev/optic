import { program as cli } from 'commander';
import { ApiCheckService } from '../sdk/api-check-service';
import { registerCompare } from './commands/compare';
import { registerBulkCompare } from './commands/bulk-compare';
import { initSentry } from './sentry';
import { initSegment, trackEvent } from './segment';
import { CliConfig } from './types';
import { OpticCINamedRulesets } from '../sdk/ruleset';
import {
  registerCreateContext,
  registerCreateGithubContext,
} from './commands/create-context/create-github-context';
import { registerCreateManualContext } from './commands/create-context/create-manual-context';
const packageJson = require('../../package.json');

export function makeCiCliWithNamedRules(
  forProject: string,
  rulesetServices: OpticCINamedRulesets,
  options: CliConfig = {}
) {
  initSentry(packageJson.version);
  initSegment();
  trackEvent('optic-ci-run', forProject, {
    version: packageJson.version,
  });

  cli.version(
    `for ${forProject}, running optic api-check ${packageJson.version}`
  );

  registerCreateContext(cli);
  registerCreateGithubContext(cli);
  registerCreateManualContext(cli);
  registerCompare(cli, forProject, rulesetServices, options);
  registerBulkCompare(cli, forProject, rulesetServices, options);

  return cli;
}

export function makeCiCli<T>(
  forProject: string,
  checkService: ApiCheckService<T>,
  options: CliConfig = {}
) {
  return makeCiCliWithNamedRules(
    forProject,
    { default: checkService },
    options
  );
}
