import { OpenAPIV3, Result } from '@useoptic/openapi-utilities';
import { createOperation } from './data-constructors';
import { Rules, RulesetData, EndpointNode } from './rule-runner-types';
import {
  createRulesetMatcher,
  getRuleAliases,
  createAfterOperationContext,
  createBeforeOperationContext,
} from './utils';

import { Ruleset, OperationRule } from '../rules';

const getOperationRules = (rules: Rules[]): (OperationRule & RulesetData)[] => {
  const operationRules: (OperationRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (ruleOrRuleset instanceof OperationRule) {
      operationRules.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (ruleOrRuleset instanceof Ruleset) {
      for (const rule of ruleOrRuleset.rules) {
        if (rule instanceof OperationRule) {
          operationRules.push({
            ...rule,
            matches: createRulesetMatcher({
              ruleMatcher: rule.matches,
              rulesetMatcher: ruleOrRuleset.matches,
            }),
            aliases: getRuleAliases(ruleOrRuleset.name, rule.name),
            docsLink: rule.docsLink || ruleOrRuleset.docsLink,
          });
        }
      }
    }
  }

  return operationRules;
};

export const runOperationRules = ({
  operation,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  operation: EndpointNode;
  rules: Rules[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}): Result[] => {
  const operationRules = getOperationRules(rules);
  const beforeOperation = createOperation(operation, 'before', beforeApiSpec);
  const afterOperation = createOperation(operation, 'after', afterApiSpec);

  for (const operationRule of operationRules) {
    if (beforeOperation) {
      const beforeRulesContext = createBeforeOperationContext(
        beforeOperation,
        customRuleContext
      );

      if (
        !operationRule.matches ||
        operationRule.matches(beforeOperation, beforeRulesContext)
      ) {
        // TODO pass in assertions + catch rule errors
        // TODO create helper for this
        // operationRule.rule()
        // TODO run operation rules
        // TODO run query parameters
        // TODO run header param
        // TODO run path param
      }
    }

    if (afterOperation) {
      const afterRulesContext = createAfterOperationContext(
        afterOperation,
        customRuleContext,
        operation.change?.changeType || null
      );

      if (
        !operationRule.matches ||
        operationRule.matches(afterOperation, afterRulesContext)
      ) {
        // TODO pass in assertions + catch rule errors
        // TODO create helper for this
        // operationRule.rule()
        // TODO run operation rules
        // TODO run query parameters
        // TODO run header param
        // TODO run path param
      }
    }
  }

  return [];
};
