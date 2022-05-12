import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import {
  createOperation,
  createRequest,
  createSpecification,
} from './data-constructors';
import {
  RulesetData,
  EndpointNode,
  RequestNode,
  NodeDetail,
} from './rule-runner-types';
import {
  createRulesetMatcher,
  getRuleAliases,
  createOperationContext,
} from './utils';

import { Rule, Ruleset, RequestRule } from '../rules';
import {
  assertionLifecycleToText,
  AssertionResult,
  createRequestAssertions,
} from './assertions';
import { Field, Operation, RequestBody } from '../types';

const getRequestRules = (
  rules: (Ruleset | Rule)[]
): (RequestRule & RulesetData)[] => {
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

const createRequestBodyResult = (
  assertionResult: AssertionResult,
  request: RequestBody,
  operation: Operation,
  rule: RequestRule
): Result => ({
  where: `${assertionLifecycleToText(
    assertionResult.type
  )} request with content-type: ${
    request.contentType
  } in operation: ${operation.method.toUpperCase()} ${operation.path}`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  passed: assertionResult.passed,
  received: assertionResult.received,
  expected: assertionResult.expected,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

const createRequestPropertyResult = (
  assertionResult: AssertionResult,
  property: Field,
  request: RequestBody,
  operation: Operation,
  rule: RequestRule
): Result => ({
  where: `${assertionLifecycleToText(
    assertionResult.type
  )} property: ${property.location.conceptualLocation.jsonSchemaTrail.join(
    '/'
  )} request body: ${
    request.contentType
  } in operation: ${operation.method.toUpperCase()} ${operation.path}`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  passed: assertionResult.passed,
  received: assertionResult.received,
  expected: assertionResult.expected,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

export const runRequestRules = ({
  specification,
  operation,
  request,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  specification: NodeDetail<OpenApiKind.Specification>;
  operation: EndpointNode;
  request: RequestNode;
  rules: (Ruleset | Rule)[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}) => {
  const results: Result[] = [];
  const requestRules = getRequestRules(rules);
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
  for (const requestRule of requestRules) {
    if (beforeOperation && beforeSpecification) {
      const beforeRulesContext = createOperationContext({
        operation: beforeOperation,
        custom: customRuleContext,
        operationChangeType: operation.change?.changeType || null,
        specification: beforeSpecification,
        specificationNode: specification,
      });
      const requestAssertions = createRequestAssertions();
      requestRule.rule(requestAssertions, beforeRulesContext);

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
            results.push(
              ...requestAssertions.body
                .runBefore(
                  beforeRequest,
                  request.bodies.get(contentType)?.change || null
                )
                .map((assertionResult) =>
                  createRequestBodyResult(
                    assertionResult,
                    beforeRequest,
                    beforeOperation,
                    requestRule
                  )
                )
            );

            for (const [key, property] of beforeRequest.properties.entries()) {
              const propertyChange =
                request.bodies.get(contentType)?.fields.get(key)?.change ||
                null;

              results.push(
                ...requestAssertions.property
                  .runBefore(property, propertyChange)
                  .map((assertionResult) =>
                    createRequestPropertyResult(
                      assertionResult,
                      property,
                      beforeRequest,
                      beforeOperation,
                      requestRule
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
      const requestAssertions = createRequestAssertions();
      requestRule.rule(requestAssertions, afterRulesContext);
      for (const contentType of request.bodies.keys()) {
        const maybeBeforeRequest = createRequest(
          request,
          contentType,
          'before',
          beforeApiSpec
        );
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
            results.push(
              ...requestAssertions.body
                .runAfter(
                  maybeBeforeRequest,
                  afterRequest,
                  request.bodies.get(contentType)?.change || null
                )
                .map((assertionResult) =>
                  createRequestBodyResult(
                    assertionResult,
                    afterRequest,
                    afterOperation,
                    requestRule
                  )
                )
            );

            for (const [key, property] of afterRequest.properties.entries()) {
              const maybeBeforeProperty =
                maybeBeforeRequest?.properties.get(key) || null;
              const propertyChange =
                request.bodies.get(contentType)?.fields.get(key)?.change ||
                null;

              results.push(
                ...requestAssertions.property
                  .runAfter(maybeBeforeProperty, property, propertyChange)
                  .map((assertionResult) =>
                    createRequestPropertyResult(
                      assertionResult,
                      property,
                      afterRequest,
                      afterOperation,
                      requestRule
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
