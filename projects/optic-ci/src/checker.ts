import {
  ApiCheckService,
  ApiCheckDslContext,
  makeApiChecksForStandards,
} from '@useoptic/api-checks';

import { NamingChecksConfig } from '@useoptic/api-checks/build/rulesets/naming/helpers/config';

type OpticNamedRulesCheck = {
  name: 'optic-named-checks';
  type?: undefined;
  config: NamingChecksConfig;
};

type BreakingChangesCheck = {
  name: 'optic-breaking-changes';
  type?: undefined;
};

type CustomRuleCheck = {
  name: string;
  type: 'custom';
  checkService: ApiCheckService<any>;
};

export type CheckConfiguration =
  | OpticNamedRulesCheck
  | BreakingChangesCheck
  | CustomRuleCheck;

const defaultChecks: CheckConfiguration[] = [
  { name: 'optic-breaking-changes' },
];

export const buildCheckerFromConfig = (checks?: CheckConfiguration[]) => {
  // TODO RA-V2 deprecate this
  checks = checks || defaultChecks;
  const baseChecker = new ApiCheckService<ApiCheckDslContext>();

  for (const check of checks) {
    if (check.type === 'custom') {
      // TODO do something with name to identify check service
      baseChecker.mergeWith(check.checkService);
    } else if (check.name === 'optic-named-checks') {
      // this function mutates, but it might be clearer to set the return to the base checker
      makeApiChecksForStandards(
        {
          naming: check.config,
          breakingChanges: false,
        },
        baseChecker
      );
    } else if (check.name === 'optic-breaking-changes') {
      // this function mutates, but it might be clearer to set the return to the base checker
      makeApiChecksForStandards(
        {
          naming: {},
          breakingChanges: { failOn: 'all' },
        },
        baseChecker
      );
    } else {
      console.warn(
        `check not applied - currently unsupported ${JSON.stringify(check)}`
      );
    }
  }

  return baseChecker;
};
