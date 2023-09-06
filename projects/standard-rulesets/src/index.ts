export * from './breaking-changes';
export * from './naming-changes';
export * from './examples';
export * from './spectral';

import { BreakingChangesRuleset } from './breaking-changes';
import { NamingChangesRuleset } from './naming-changes';
import { ExamplesRuleset } from './examples';
import { SpectralRulesets } from './spectral';

export const StandardRulesets = {
  'breaking-changes': BreakingChangesRuleset,
  naming: NamingChangesRuleset,
  spectral: SpectralRulesets,
  examples: ExamplesRuleset,
};
