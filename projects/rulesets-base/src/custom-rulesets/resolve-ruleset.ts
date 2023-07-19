import Ajv, { AnySchema } from 'ajv';

import { Ruleset } from '../rules/ruleset';

type RulesetModule = {
  default: {
    name: string;
    description: string;
    configSchema: AnySchema;
    rulesetConstructor: (config: unknown) => Ruleset;
  };
};

export type RulesetDef = {
  name: string;
  config: unknown;
};

const ajv = new Ajv();

export async function resolveRuleset(
  ruleset: RulesetDef,
  rulesetPath: string
): Promise<Ruleset | string> {
  const rulesetMod = (await import(rulesetPath)).default as RulesetModule;

  const validate = ajv.compile(rulesetMod.default.configSchema);
  const valid = validate(ruleset.config);
  if (valid) {
    return rulesetMod.default.rulesetConstructor(ruleset.config);
  } else {
    return `Ruleset ${ruleset.name} had configuration errors:\n${ajv.errorsText(
      validate.errors
    )}`;
  }
}
