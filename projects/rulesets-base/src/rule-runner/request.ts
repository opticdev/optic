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
  createRuleContext,
  isExempted,
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
    if (RequestRule.isInstance(ruleOrRuleset)) {
      requestRules.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (Ruleset.isInstance(ruleOrRuleset)) {
      for (const rule of ruleOrRuleset.rules) {
        if (RequestRule.isInstance(rule)) {
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
  exempted: assertionResult.exempted,
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
  specificationNode,
  operationNode,
  requestNode,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  specificationNode: NodeDetail<OpenApiKind.Specification>;
  operationNode: EndpointNode;
  requestNode: RequestNode;
  rules: (Ruleset | Rule)[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}) => {
  const results: Result[] = [];
  const requestRules = getRequestRules(rules);
  const beforeSpecification = createSpecification(
    specificationNode,
    'before',
    beforeApiSpec
  );
  const beforeOperation = createOperation(
    operationNode,
    'before',
    beforeApiSpec
  );
  const afterSpecification = createSpecification(
    specificationNode,
    'after',
    afterApiSpec
  );
  const afterOperation = createOperation(operationNode, 'after', afterApiSpec);

  // Runs rules on all requests - this will:
  // - run rules with values from the before spec (this will trigger `removed` rules)
  // - run rules with values from the after spec (this will trigger `added`, `changed` and `requirement` rules)

  // for each rule:
  // - if there is a matches block, check if the current operation matches the rule `matches` condition
  // - if yes, run the user's defined `rule`. for requests, this runs against the request body and request properties
  for (const requestRule of requestRules) {
    if (beforeOperation && beforeSpecification) {
      const ruleContext = createRuleContext({
        operation: beforeOperation,
        custom: customRuleContext,
        operationChangeType: operationNode.change?.changeType || null,
        specification: beforeSpecification,
        specificationNode: specificationNode,
      });
      const requestAssertions = createRequestAssertions();
      // Register the user's rule definition, this is collected in the requestAssertions object
      requestRule.rule(requestAssertions, ruleContext);

      for (const contentType of requestNode.bodies.keys()) {
        const beforeRequest = createRequest(
          requestNode,
          contentType,
          'before',
          beforeApiSpec
        );
        if (beforeRequest) {
          const matches =
            !requestRule.matches ||
            requestRule.matches(beforeRequest, ruleContext);

          const exempted = isExempted(beforeRequest.raw, requestRule.name);

          if (matches) {
            // Run the user's rules that have been stored in requestAssertions for body
            results.push(
              ...requestAssertions.body
                .runBefore(
                  beforeRequest,
                  requestNode.bodies.get(contentType)?.change || null,
                  exempted
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
                requestNode.bodies.get(contentType)?.fields.get(key)?.change ||
                null;

              // Run the user's rules that have been stored in requestAssertions for property
              results.push(
                ...requestAssertions.property
                  .runBefore(property, propertyChange, exempted)
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
      const ruleContext = createRuleContext({
        operation: afterOperation,
        custom: customRuleContext,
        operationChangeType: operationNode.change?.changeType || null,
        specification: afterSpecification,
        specificationNode: specificationNode,
      });
      const requestAssertions = createRequestAssertions();
      // Register the user's rule definition, this is collected in the requestAssertions object
      requestRule.rule(requestAssertions, ruleContext);
      for (const contentType of requestNode.bodies.keys()) {
        const maybeBeforeRequest = createRequest(
          requestNode,
          contentType,
          'before',
          beforeApiSpec
        );
        const afterRequest = createRequest(
          requestNode,
          contentType,
          'after',
          afterApiSpec
        );
        if (afterRequest) {
          const matches =
            !requestRule.matches ||
            requestRule.matches(afterRequest, ruleContext);

          const exempted = isExempted(afterRequest.raw, requestRule.name);

          if (matches) {
            // Run the user's rules that have been stored in requestAssertions for body
            results.push(
              ...requestAssertions.body
                .runAfter(
                  maybeBeforeRequest,
                  afterRequest,
                  requestNode.bodies.get(contentType)?.change || null,
                  exempted
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
                requestNode.bodies.get(contentType)?.fields.get(key)?.change ||
                null;

              // Run the user's rules that have been stored in requestAssertions for property
              results.push(
                ...requestAssertions.property
                  .runAfter(
                    maybeBeforeProperty,
                    property,
                    propertyChange,
                    exempted
                  )
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
