import {
  ApiCheckService,
  ApiCheckDslContext,
  makeApiChecksForStandards,
} from '@useoptic/api-checks';

import { NamingChecksConfig } from '@useoptic/api-checks/build/rulesets/naming/helpers/config';

type OpticNamedRulesCheck = {
  name: 'optic-named-checks';
  config: NamingChecksConfig;
};

// TODO add in custom rule check
export type CheckConfiguration = OpticNamedRulesCheck;

export const buildCheckerFromConfig = (checks: CheckConfiguration[]) => {
  const baseChecker = new ApiCheckService<ApiCheckDslContext>();

  for (const check of checks) {
    if (check.name === 'optic-named-checks') {
      // this function mutates, but it might be clearer to set the return to the base checker
      makeApiChecksForStandards(
        {
          naming: check.config,
          breakingChanges: { failOn: 'all' },
        },
        baseChecker
      );
    } else {
      // TODO implement custom checks, and other checks
      console.warn(
        `check not applied - currently unsupported ${JSON.stringify(check)}`
      );
    }
  }

  return baseChecker;
};
