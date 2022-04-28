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
import {
  assertionLifecycleToText,
  AssertionResult,
  createResponseAssertions,
} from './assertions';
import { Field, Operation, Response } from '../types';

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

const createResponeBodyResult = (
  assertionResult: AssertionResult,
  response: Response,
  operation: Operation,
  rule: ResponseRule
): Result => ({
  where: `${assertionLifecycleToText(
    assertionResult.type
  )} response status code: ${response.statusCode} with content-type: ${
    response.contentType
  }  in operation: ${operation.method.toUpperCase()} ${operation.path}`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  passed: assertionResult.passed,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

const createResponsePropertyResult = (
  assertionResult: AssertionResult,
  property: Field,
  response: Response,
  operation: Operation,
  rule: ResponseRule
): Result => ({
  where: `${assertionLifecycleToText(
    assertionResult.type
  )} property: ${property.location.conceptualLocation.jsonSchemaTrail.join(
    '/'
  )} in response status code: ${response.statusCode} with content-type: ${
    response.contentType
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
  } with content-type: ${
    response.contentType
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
  rules: Rules[];
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
      const responseAssertions = createResponseAssertions();
      responseRule.rule(responseAssertions, beforeRulesContext);

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
            results.push(
              ...responseAssertions.body
                .runBefore(
                  beforeResponse,
                  response.bodies.get(contentType)?.change || null
                )
                .map((assertionResult) =>
                  createResponeBodyResult(
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
            for (const [key, property] of beforeResponse.properties.entries()) {
              const propertyChange =
                response.bodies.get(contentType)?.fields.get(key)?.change ||
                null;

              results.push(
                ...responseAssertions.property
                  .runBefore(property, propertyChange)
                  .map((assertionResult) =>
                    createResponsePropertyResult(
                      assertionResult,
                      property,
                      beforeResponse,
                      beforeOperation,
                      responseRule
                    )
                  )
              );
            }
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
      const responseAssertions = createResponseAssertions();
      responseRule.rule(responseAssertions, afterRulesContext);

      for (const contentType of response.bodies.keys()) {
        const maybeBeforeResponse = createResponse(
          response,
          contentType,
          'before',
          beforeApiSpec
        );
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
            results.push(
              ...responseAssertions.body
                .runAfter(
                  maybeBeforeResponse,
                  afterResponse,
                  response.bodies.get(contentType)?.change || null
                )
                .map((assertionResult) =>
                  createResponeBodyResult(
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
            for (const [key, property] of afterResponse.properties.entries()) {
              const maybeBeforeProperty =
                maybeBeforeResponse?.properties.get(key) || null;

              const propertyChange =
                response.bodies.get(contentType)?.fields.get(key)?.change ||
                null;

              results.push(
                ...responseAssertions.property
                  .runAfter(maybeBeforeProperty, property, propertyChange)
                  .map((assertionResult) =>
                    createResponsePropertyResult(
                      assertionResult,
                      property,
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
    }
  }

  return results;
};
