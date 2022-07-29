export * from './breaking-changes';
export * from './naming-changes';

import { BreakingChangesRuleset } from './breaking-changes';
import { NamingChangesRuleset } from './naming-changes';

export const StandardRulesets = {
  'breaking-changes': BreakingChangesRuleset,
  'naming-changes': NamingChangesRuleset,
};
