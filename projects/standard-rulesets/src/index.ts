export * from './breaking-changes';
export * from './naming-changes';
export * from './examples';

import { BreakingChangesRuleset } from './breaking-changes';
import { NamingChangesRuleset } from './naming-changes';
import { ExamplesRuleset } from './examples';

export const StandardRulesets = {
  'breaking-changes': BreakingChangesRuleset,
  naming: NamingChangesRuleset,

  examples: ExamplesRuleset,
};
