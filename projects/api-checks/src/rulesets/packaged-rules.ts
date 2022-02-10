import { OpticCINamedRulesets } from '../sdk/ruleset';
import { ApiCheckService } from '../sdk/api-check-service';
import { namingRules } from './naming/service';
import { ApiCheckDslContext } from '../sdk/api-change-dsl';
import { breakingChangeRules } from './breaking-changes/service';
import { NamingChecksConfig } from './naming/helpers/config';

export const packagedRules: {
  breaking: ApiCheckService<ApiCheckDslContext>;
} & OpticCINamedRulesets = {
  // make sure these keys are snake case / CLI friendly
  default: breakingChangeRules({}),
  breaking: breakingChangeRules({}),
};

export const standards = {
  breakingChangeRules,
  namingRules,
};

export type StandardApiChecks = {
  naming: NamingChecksConfig;
  breakingChanges:
    | {
        failOn: 'all';
      }
    | false;
};

export function makeApiChecksForStandards(
  config: StandardApiChecks,
  service: ApiCheckService<ApiCheckDslContext> = new ApiCheckService<ApiCheckDslContext>()
) {
  const naming = namingRules(config.naming);
  service.mergeWith(naming);
  const breaking = config.breakingChanges
    ? breakingChangeRules()
    : new ApiCheckService<ApiCheckDslContext>();
  service.mergeWith(breaking);

  return service;
}
