import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import {
  createOperation,
  createResponse,
  createSpecification,
} from './data-constructors';
import {
  RulesetData,
  EndpointNode,
  ResponseNode,
  NodeDetail,
} from './rule-runner-types';
import {
  createOperationContext,
  createRulesetMatcher,
  getRuleAliases,
} from './utils';

import { Rule, Ruleset, ResponseBodyRule } from '../rules';
import {
  assertionLifecycleToText,
  AssertionResult,
  createResponseBodyAssertions,
} from './assertions';
import { Field, Operation, ResponseBody } from '../types';

const getResponseBodyRules = (
  rules: (Ruleset | Rule)[]
): (ResponseBodyRule & RulesetData)[] => {
  const responseRule: (ResponseBodyRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (ruleOrRuleset instanceof ResponseBodyRule) {
      responseRule.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (ruleOrRuleset instanceof Ruleset) {
      for (const rule of ruleOrRuleset.rules) {
        if (rule instanceof ResponseBodyRule) {
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

const createResponseBodyResult = (
  assertionResult: AssertionResult,
  response: ResponseBody,
  operation: Operation,
  rule: ResponseBodyRule
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
  received: assertionResult.received,
  expected: assertionResult.expected,
  docsLink: rule.docsLink,
  isShould: false,
});

const createResponsePropertyResult = (
  assertionResult: AssertionResult,
  property: Field,
  response: ResponseBody,
  operation: Operation,
  rule: ResponseBodyRule
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
  received: assertionResult.received,
  expected: assertionResult.expected,
  docsLink: rule.docsLink,
  isShould: false,
});

export const runResponseBodyRules = ({
  specification,
  operation,
  response,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  specification: NodeDetail<OpenApiKind.Specification>;
  operation: EndpointNode;
  response: ResponseNode;
  rules: (Ruleset | Rule)[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}) => {
  const results: Result[] = [];
  const responseRules = getResponseBodyRules(rules);
  const beforeSpecification = createSpecification(
    specification,
    'before',
    beforeApiSpec
  );
  const beforeOperation = createOperation(operation, 'before', beforeApiSpec);
  const afterSpecification = createSpecification(
    specification,
    'after',
    afterApiSpec
  );
  const afterOperation = createOperation(operation, 'after', afterApiSpec);
  for (const responseRule of responseRules) {
    if (beforeOperation && beforeSpecification) {
      const beforeRulesContext = createOperationContext({
        operation: beforeOperation,
        custom: customRuleContext,
        operationChangeType: operation.change?.changeType || null,
        specification: beforeSpecification,
        specificationNode: specification,
      });
      const responseAssertions = createResponseBodyAssertions();
      responseRule.rule(responseAssertions, beforeRulesContext);

      const beforeResponse = createResponse(response, 'before', beforeApiSpec);
      if (beforeResponse) {
        for (const beforeBody of beforeResponse.bodies) {
          if (
            !responseRule.matches ||
            responseRule.matches(beforeBody, beforeRulesContext)
          ) {
            results.push(
              ...responseAssertions.body
                .runBefore(
                  beforeBody,
                  response.bodies.get(beforeBody.contentType)?.change || null
                )
                .map((assertionResult) =>
                  createResponseBodyResult(
                    assertionResult,
                    beforeBody,
                    beforeOperation,
                    responseRule
                  )
                )
            );

            for (const [key, property] of beforeBody.properties.entries()) {
              const propertyChange =
                response.bodies.get(beforeBody.contentType)?.fields.get(key)
                  ?.change || null;

              results.push(
                ...responseAssertions.property
                  .runBefore(property, propertyChange)
                  .map((assertionResult) =>
                    createResponsePropertyResult(
                      assertionResult,
                      property,
                      beforeBody,
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

    if (afterOperation && afterSpecification) {
      const afterRulesContext = createOperationContext({
        operation: afterOperation,
        custom: customRuleContext,
        operationChangeType: operation.change?.changeType || null,
        specification: afterSpecification,
        specificationNode: specification,
      });
      const responseAssertions = createResponseBodyAssertions();
      responseRule.rule(responseAssertions, afterRulesContext);

      const maybeBeforeResponse = createResponse(
        response,
        'before',
        beforeApiSpec
      );
      const afterResponse = createResponse(response, 'after', afterApiSpec);
      if (afterResponse) {
        for (const afterBody of afterResponse.bodies) {
          const maybeBeforeBody =
            maybeBeforeResponse?.bodies.find(
              (body) => body.contentType === afterBody.contentType
            ) || null;
          if (
            !responseRule.matches ||
            responseRule.matches(afterBody, afterRulesContext)
          ) {
            results.push(
              ...responseAssertions.body
                .runAfter(
                  maybeBeforeBody,
                  afterBody,
                  response.bodies.get(afterBody.contentType)?.change || null
                )
                .map((assertionResult) =>
                  createResponseBodyResult(
                    assertionResult,
                    afterBody,
                    afterOperation,
                    responseRule
                  )
                )
            );

            for (const [key, property] of afterBody.properties.entries()) {
              const maybeBeforeProperty =
                maybeBeforeBody?.properties.get(key) || null;

              const propertyChange =
                response.bodies.get(afterBody.contentType)?.fields.get(key)
                  ?.change || null;

              results.push(
                ...responseAssertions.property
                  .runAfter(maybeBeforeProperty, property, propertyChange)
                  .map((assertionResult) =>
                    createResponsePropertyResult(
                      assertionResult,
                      property,
                      afterBody,
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
