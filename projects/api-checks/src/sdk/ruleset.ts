import { ApiCheckDsl } from '@useoptic/openapi-utilities';
import { ApiCheckService } from './api-check-service';
import { ApiCheckDslContext } from './api-change-dsl';

export type OpticCIRuleset<DSL extends ApiCheckDsl> = {
  [key: string]: (dsl: DSL) => void;
};

export function mergeRulesets<DSL extends ApiCheckDsl>(
  ...rules: OpticCIRuleset<DSL>[]
): OpticCIRuleset<DSL> {
  const allRules: OpticCIRuleset<DSL> = {};
  rules.forEach((set) => {
    Object.entries(set).forEach(([key, value]) => {
      if (allRules.hasOwnProperty(key)) {
        console.warn(`rule with '${key}' defined more than once. Overwritten`);
      }
      allRules[key] = value;
    });
  });

  return allRules;
}

export function disableRules<DSL extends ApiCheckDsl>(
  dsl: OpticCIRuleset<DSL>,
  ...rules: string[]
) {
  rules.forEach((ruleKey) => {
    delete dsl[ruleKey];
  });
}

export type OpticCINamedRulesets = {
  default: ApiCheckService<any>;
} & {
  // actually any, could be multiple DSL kinds / contexts in the same CLI
  // ie one we made, one the community made, one a customer built in-house
  [key: string]: ApiCheckService<any> | undefined;
};
