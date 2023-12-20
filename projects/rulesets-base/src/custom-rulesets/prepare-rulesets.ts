import { Ruleset, ExternalRule } from '../rules/ruleset';
import { downloadRuleset } from './download-ruleset';
import { resolveRuleset } from './resolve-ruleset';

export type RulesetDef = {
  name: string;
  config: unknown;
};

export type RulesetPayload = {
  ruleset: RulesetDef[];
  localRulesets: Record<string, string>;
  hostedRulesets: Record<
    string,
    {
      uploaded_at: string;
      url: string;
    }
  >;
  standardRulesets: Record<
    string,
    {
      fromOpticConfig: (
        config: unknown,
        options: {
          client: any;
          specVersion: '3.1.x' | '3.0.x';
        }
      ) => Promise<Ruleset | ExternalRule | string>;
    }
  >;
};

export type PrepareRulesetsResult = {
  rulesets: (Ruleset | ExternalRule)[];
  warnings: string[];
};

export async function prepareRulesets(
  payload: RulesetPayload,
  options: {
    client: any;
    specVersion: '3.1.x' | '3.0.x';
  }
): Promise<PrepareRulesetsResult> {
  const StandardRulesets = payload.standardRulesets;
  const rulesets: (Ruleset | ExternalRule)[] = [];
  const warnings: string[] = [];

  for (const ruleset of payload.ruleset) {
    let instanceOrErrorMsg: Ruleset | ExternalRule | string;
    if (StandardRulesets[ruleset.name as keyof typeof StandardRulesets]) {
      const RulesetClass =
        StandardRulesets[ruleset.name as keyof typeof StandardRulesets];
      try {
        instanceOrErrorMsg = await RulesetClass.fromOpticConfig(
          ruleset.config,
          { client: options.client, specVersion: options.specVersion }
        );
      } catch (e) {
        console.error(e);
        warnings.push(`Constructing ruleset ${ruleset.name} failed`);
        continue;
      }
    } else if (payload.localRulesets[ruleset.name]) {
      try {
        instanceOrErrorMsg = await resolveRuleset(
          ruleset,
          payload.localRulesets[ruleset.name]
        );
      } catch (e) {
        console.error(e);
        warnings.push(`Constructing ruleset ${ruleset.name} failed`);
        continue;
      }
    } else if (payload.hostedRulesets[ruleset.name]) {
      const hostedRuleset = payload.hostedRulesets[ruleset.name];
      let rulesetPath: string;

      try {
        rulesetPath = await downloadRuleset(
          ruleset.name,
          hostedRuleset.url,
          hostedRuleset.uploaded_at
        );
      } catch (e) {
        warnings.push(`Loading ruleset ${ruleset.name} failed`);
        continue;
      }
      try {
        instanceOrErrorMsg = await resolveRuleset(ruleset, rulesetPath);
      } catch (e) {
        console.error(e);
        warnings.push(`Constructing ruleset ${ruleset.name} failed`);
        continue;
      }
    } else {
      warnings.push(`Ruleset ${ruleset.name} does not exist`);
      continue;
    }
    if (typeof instanceOrErrorMsg === 'string') {
      warnings.push(instanceOrErrorMsg);
    } else {
      rulesets.push(instanceOrErrorMsg);
    }
  }

  return {
    warnings,
    rulesets,
  };
}
