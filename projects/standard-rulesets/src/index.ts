export * from './breaking-changes';
export * from './naming-changes';
export * from './examples';

import { BreakingChangesRuleset } from './breaking-changes';
import { NamingChangesRuleset } from './naming-changes';
import { ExamplesRuleset } from './examples';
import { SpectralOasV6Ruleset } from './spectral-oas-v6';

export const StandardRulesets = {
  'breaking-changes': BreakingChangesRuleset,
  naming: NamingChangesRuleset,
  'spectral-oas-v6': SpectralOasV6Ruleset,
  examples: ExamplesRuleset,
};
