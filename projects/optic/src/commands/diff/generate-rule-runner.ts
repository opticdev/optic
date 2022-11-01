import { OpticCliConfig } from '../../config';
import { StandardRulesets } from '@useoptic/standard-rulesets';
import { RuleRunner, Ruleset, CustomRuleset } from '@useoptic/rulesets-base';
import { createOpticClient } from '@useoptic/optic-ci/build/cli/clients/optic-client';

// TODO do we need a better qualifier here to avoid false positive local runs?
const isLocalJsFile = (name: string) => name.endsWith('.js');

export const generateRuleRunner = async (
  config: OpticCliConfig,
  checksEnabled: boolean
): Promise<RuleRunner> => {
  const rulesets: Ruleset[] = [];
  const warnings: string[] = [];

  if (checksEnabled) {
    const client = createOpticClient('');
    for (const ruleset of config.ruleset) {
      let instanceOrErrorMsg: Ruleset | string
      if (StandardRulesets[ruleset.name as keyof typeof StandardRulesets]) {
        const RulesetClass =
          StandardRulesets[ruleset.name as keyof typeof StandardRulesets];
        instanceOrErrorMsg = RulesetClass.fromOpticConfig(ruleset.config);
      } else if (isLocalJsFile(ruleset.name)) {
        try {
          instanceOrErrorMsg = await CustomRuleset.resolveRuleset(ruleset, ruleset.name);
        }
        catch (e) {
          console.error(e);
          warnings.push(`Constructing ruleset ${ruleset.name} failed`);
          continue;
        }
      } else {
        // TODO connnect up
        const hostedRuleset = await (client as any).getRulesetByName(ruleset.name);
        if (!hostedRuleset) {
          warnings.push(`Ruleset ${ruleset.name} does not exist`);
          continue;
        }
        let rulesetPath: string;

        try {
          rulesetPath = await CustomRuleset.downloadRuleset(
            ruleset.name,
            hostedRuleset.url,
            hostedRuleset.uploaded_at
          );
        } catch (e) {
          warnings.push(`Loading ruleset ${ruleset.name} failed`);
          continue;  
        }
        try {
          instanceOrErrorMsg = await CustomRuleset.resolveRuleset(ruleset, rulesetPath);
        } catch (e) {
          console.error(e);
          warnings.push(`Constructing ruleset ${ruleset.name} failed`);
          continue;
        }
      }
      if (Ruleset.isInstance(instanceOrErrorMsg)) {
        rulesets.push(instanceOrErrorMsg);
      } else {
        warnings.push(instanceOrErrorMsg);
      }
    }
  }

  for (const warning of warnings) {
    console.error(warning);
  }

  return new RuleRunner(rulesets);
};
