import { OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import { createOperation, createResponse } from './data-constructors';
import { RulesetData, EndpointNode, ResponseNode } from './rule-runner-types';
import {
  createAfterOperationContext,
  createBeforeOperationContext,
  createRulesetMatcher,
  getRuleAliases,
} from './utils';

import { Rule, Ruleset, ResponseRule } from '../rules';
import {
  assertionLifecycleToText,
  AssertionResult,
  createResponseAssertions,
} from './assertions';
import { Operation, Response } from '../types';

const getResponseRules = (
  rules: (Ruleset | Rule)[]
): (ResponseRule & RulesetData)[] => {
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

const createResponseResult = (
  assertionResult: AssertionResult,
  response: Response,
  operation: Operation,
  rule: ResponseRule
): Result => ({
  where: `${assertionLifecycleToText(
    assertionResult.type
  )} response status code: ${
    response.statusCode
  } in operation: ${operation.method.toUpperCase()} ${operation.path}`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  passed: assertionResult.passed,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

const createResponseHeaderResult = (
  assertionResult: AssertionResult,
  header: string,
  response: Response,
  operation: Operation,
  rule: ResponseRule
): Result => ({
  where: `${assertionLifecycleToText(
    assertionResult.type
  )} response header: ${header} in response status code: ${
    response.statusCode
  } in operation: ${operation.method.toUpperCase()} ${operation.path}`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  passed: assertionResult.passed,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

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
  rules: (Ruleset | Rule)[];

  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}) => {
  const results: Result[] = [];
  const responseRules = getResponseRules(rules);
  const beforeOperation = createOperation(operation, 'before', beforeApiSpec);
  const afterOperation = createOperation(operation, 'after', afterApiSpec);
  for (const responseRule of responseRules) {
    if (beforeOperation) {
      const beforeRulesContext = createBeforeOperationContext(
        beforeOperation,
        customRuleContext
      );
      const beforeResponse = createResponse(response, 'before', beforeApiSpec);
      const responseAssertions = createResponseAssertions();
      responseRule.rule(responseAssertions, beforeRulesContext);
      if (
        beforeResponse &&
        (!responseRule.matches ||
          responseRule.matches(beforeResponse, beforeRulesContext))
      ) {
        results.push(
          ...responseAssertions
            .runBefore(beforeResponse, response.change)
            .map((assertionResult) =>
              createResponseResult(
                assertionResult,
                beforeResponse,
                beforeOperation,
                responseRule
              )
            )
        );
        for (const [key, header] of beforeResponse.headers.entries()) {
          const headerChange = response.headers.get(key)?.change || null;

          results.push(
            ...responseAssertions.header
              .runBefore(header, headerChange)
              .map((assertionResult) =>
                createResponseHeaderResult(
                  assertionResult,
                  key,
                  beforeResponse,
                  beforeOperation,
                  responseRule
                )
              )
          );
        }
      }
    }

    if (afterOperation) {
      const afterRulesContext = createAfterOperationContext(
        afterOperation,
        customRuleContext,
        operation.change?.changeType || null
      );
      const maybeBeforeResponse = createResponse(
        response,
        'before',
        beforeApiSpec
      );
      const afterResponse = createResponse(response, 'after', afterApiSpec);
      const responseAssertions = createResponseAssertions();
      responseRule.rule(responseAssertions, afterRulesContext);
      if (
        afterResponse &&
        (!responseRule.matches ||
          responseRule.matches(afterResponse, afterRulesContext))
      ) {
        results.push(
          ...responseAssertions
            .runAfter(maybeBeforeResponse, afterResponse, response.change)
            .map((assertionResult) =>
              createResponseResult(
                assertionResult,
                afterResponse,
                afterOperation,
                responseRule
              )
            )
        );
        for (const [key, header] of afterResponse.headers.entries()) {
          const maybeBeforeHeader =
            maybeBeforeResponse?.headers.get(key) || null;

          const headerChange = response.headers.get(key)?.change || null;

          results.push(
            ...responseAssertions.header
              .runAfter(maybeBeforeHeader, header, headerChange)
              .map((assertionResult) =>
                createResponseHeaderResult(
                  assertionResult,
                  key,
                  afterResponse,
                  afterOperation,
                  responseRule
                )
              )
          );
        }
      }
    }
  }

  return results;
};
