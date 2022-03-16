import { program as cli } from 'commander';
import { ApiCheckService } from '../sdk/api-check-service';
import { registerCompare } from './commands/compare';
import { registerBulkCompare } from './commands/bulk-compare';
import { initSentry } from './sentry';
import { initSegment } from './segment';
import { CliConfig } from './types';
import { OpticCINamedRulesets } from '../sdk/ruleset';
import { registerCreateContext } from './commands/create-context/create-context';
const packageJson = require('../../package.json');

export function makeCiCliWithNamedRules(
  forProject: string,
  rulesetServices: OpticCINamedRulesets,
  options: CliConfig = {}
) {
  initSentry(packageJson.version);
  initSegment();

  cli.version(
    `for ${forProject}, running optic api-check ${packageJson.version}`
  );

  registerCreateContext(cli);
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
