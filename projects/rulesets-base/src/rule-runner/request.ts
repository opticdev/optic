import { OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import { createOperation, createRequest } from './data-constructors';
import {
  Rules,
  RulesetData,
  EndpointNode,
  RequestNode,
} from './rule-runner-types';
import {
  createRulesetMatcher,
  getRuleAliases,
  createAfterOperationContext,
  createBeforeOperationContext,
} from './utils';

import { Ruleset, RequestRule } from '../rules';

const getRequestRules = (rules: Rules[]): (RequestRule & RulesetData)[] => {
  const requestRules: (RequestRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (ruleOrRuleset instanceof RequestRule) {
      requestRules.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (ruleOrRuleset instanceof Ruleset) {
      for (const rule of ruleOrRuleset.rules) {
        if (rule instanceof RequestRule) {
          requestRules.push({
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

  return requestRules;
};

export const runRequestRules = ({
  operation,
  request,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  operation: EndpointNode;
  request: RequestNode;
  rules: Rules[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}) => {
  const result: Result[] = [];
  const requestRules = getRequestRules(rules);
  const beforeOperation = createOperation(operation, 'before', beforeApiSpec);
  const afterOperation = createOperation(operation, 'after', afterApiSpec);
  for (const requestRule of requestRules) {
    if (beforeOperation) {
      const beforeRulesContext = createBeforeOperationContext(
        beforeOperation,
        customRuleContext
      );

      for (const contentType of request.bodies.keys()) {
        const beforeRequest = createRequest(
          request,
          contentType,
          'before',
          beforeApiSpec
        );
        if (beforeRequest) {
          if (
            !requestRule.matches ||
            requestRule.matches(beforeRequest, beforeRulesContext)
          ) {
            // TODO pass in assertions + catch rule errors
            // TODO create helper for this
            // RequestRule.rule()
            // run request rules
            // run request body rule
            // run request property rules
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

      for (const contentType of request.bodies.keys()) {
        const afterRequest = createRequest(
          request,
          contentType,
          'after',
          afterApiSpec
        );
        if (afterRequest) {
          if (
            !requestRule.matches ||
            requestRule.matches(afterRequest, afterRulesContext)
          ) {
            // TODO pass in assertions + catch rule errors
            // TODO create helper for this
            // RequestRule.rule()
            // run request rules
            // run request body rule
            // run request property rules
          }
        }
      }
    }
  }

  return result;
};
