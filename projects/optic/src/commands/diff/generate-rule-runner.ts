import { OpticCliConfig } from '../../config';
import { StandardRulesets } from '@useoptic/standard-rulesets';
import { RuleRunner, Ruleset, CustomRuleset } from '@useoptic/rulesets-base';

function isHttpUrl(urlString: string) {
  let url;
  try {
    url = new URL(urlString);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}
export const generateRuleRunner = async (
  config: OpticCliConfig,
  rulesetMapping: Record<
    string,
    {
      url: string;
      uploaded_at: string;
    }
  >,
  checksEnabled: boolean
): Promise<RuleRunner> => {
  const rulesets: Ruleset[] = [];
  const warnings: string[] = [];

  if (checksEnabled) {
    for (const ruleset of config.ruleset) {
      let instanceOrErrorMsg: Ruleset | string;
      if (StandardRulesets[ruleset.name as keyof typeof StandardRulesets]) {
        const RulesetClass =
          StandardRulesets[ruleset.name as keyof typeof StandardRulesets];
        instanceOrErrorMsg = RulesetClass.fromOpticConfig(ruleset.config);
      } else if (rulesetMapping[ruleset.name]) {
        const url = rulesetMapping[ruleset.name].url;
        let rulesetPath: string;

        if (isHttpUrl(url)) {
          try {
            rulesetPath = await CustomRuleset.downloadRuleset(
              ruleset.name,
              url,
              rulesetMapping[ruleset.name].uploaded_at
            );
          } catch (e) {
            warnings.push(`Loading ruleset ${ruleset.name} failed`);
            continue;
          }
        } else {
          rulesetPath = url;
        }

        try {
          instanceOrErrorMsg = await CustomRuleset.resolveRuleset(
            ruleset,
            rulesetPath
          );
        } catch (e) {
          console.error(e);
          warnings.push(`Constructing ruleset ${ruleset.name} failed`);
          continue;
        }
      } else {
        warnings.push(`Invalid ruleset ${ruleset.name}`);
        continue;
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
