import { OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import { createOperation, createResponse } from './data-constructors';
import {
  Rules,
  RulesetData,
  EndpointNode,
  ResponseNode,
} from './rule-runner-types';
import {
  createAfterOperationContext,
  createBeforeOperationContext,
  createRulesetMatcher,
  getRuleAliases,
} from './utils';

import { Ruleset, ResponseRule } from '../rules';

const getResponseRules = (rules: Rules[]): (ResponseRule & RulesetData)[] => {
  const responseRule: (ResponseRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (ruleOrRuleset instanceof ResponseRule) {
      responseRule.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (ruleOrRuleset instanceof Ruleset) {
      for (const rule of ruleOrRuleset.rules) {
        if (rule instanceof ResponseRule) {
          responseRule.push({
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

  return responseRule;
};

export const runResponseRules = ({
  operation,
  response,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  operation: EndpointNode;
  response: ResponseNode;
  rules: Rules[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}) => {
  const result: Result[] = [];
  const responseRules = getResponseRules(rules);
  const beforeOperation = createOperation(operation, 'before', beforeApiSpec);
  const afterOperation = createOperation(operation, 'after', afterApiSpec);
  for (const responseRule of responseRules) {
    if (beforeOperation) {
      const beforeRulesContext = createBeforeOperationContext(
        beforeOperation,
        customRuleContext
      );

      for (const contentType of response.bodies.keys()) {
        const beforeResponse = createResponse(
          response,
          contentType,
          'before',
          beforeApiSpec
        );
        if (beforeResponse) {
          if (
            !responseRule.matches ||
            responseRule.matches(beforeResponse, beforeRulesContext)
          ) {
            // TODO pass in assertions + catch rule errors
            // TODO create helper for this
            // ResponseRule.rule()
            // run response rules
            // run response header rules
            // run response body rule
            // run response property rules
          }
        }
      }
    }

    if (afterOperation) {
      const afterRulesContext = createAfterOperationContext(
        afterOperation,
        customRuleContext,
        operation.change?.changeType || null
      );

      for (const contentType of response.bodies.keys()) {
        const afterResponse = createResponse(
          response,
          contentType,
          'after',
          afterApiSpec
        );
        if (afterResponse) {
          if (
            !responseRule.matches ||
            responseRule.matches(afterResponse, afterRulesContext)
          ) {
            // TODO pass in assertions + catch rule errors
            // TODO create helper for this
            // ResponseRule.rule()
            // run response rules
            // run response header rules
            // run response body rule
            // run response property rules
          }
        }
      }
    }
  }

  return result;
};
