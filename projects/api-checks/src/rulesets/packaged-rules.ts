import { breakingChanges } from './breaking-changes/service';
import { OpticCINamedRulesets } from '../sdk/ruleset';

export const packagedRules: OpticCINamedRulesets = {
  // make sure these keys are snake case / CLI friendly
  default: breakingChanges(),
  breaking: breakingChanges(),
};
