import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import {
  createOperation,
  createResponse,
  createSpecification,
} from './data-constructors';
import {
  EndpointNode,
  ResponseNode,
  NodeDetail,
} from './rule-runner-types';
import {
  createRuleContext,
  isExempted,
} from './utils';

import { Rule, Ruleset, ResponseBodyRule } from '../rules';
import { AssertionResult, createResponseBodyAssertions } from './assertions';
import { Field, Operation, ResponseBody } from '../types';
import { getPropertyRules, getResponseBodyRules } from './rule-filters';

const createResponseBodyResult = (
  assertionResult: AssertionResult,
  response: ResponseBody,
  operation: Operation,
  rule: ResponseBodyRule
): Result => ({
  type: assertionResult.type,
  where: `${operation.method.toUpperCase()} ${operation.path} response ${
    response.statusCode
  } response body: ${response.contentType}`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  passed: assertionResult.passed,
  exempted: assertionResult.exempted,
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
  type: assertionResult.type,
  where: `${operation.method.toUpperCase()} ${operation.path} response ${
    response.statusCode
  } response body: ${
    response.contentType
  } property ${property.location.conceptualLocation.jsonSchemaTrail.join('/')}`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  passed: assertionResult.passed,
  exempted: assertionResult.exempted,
  error: assertionResult.error,
  received: assertionResult.received,
  expected: assertionResult.expected,
  docsLink: rule.docsLink,
  isShould: false,
});

export const runResponseBodyRules = ({
  specificationNode,
  operationNode,
  responseNode,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  specificationNode: NodeDetail<OpenApiKind.Specification>;
  operationNode: EndpointNode;
  responseNode: ResponseNode;
  rules: (Ruleset | Rule)[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}) => {
  const results: Result[] = [];
  const responseRules = getResponseBodyRules(rules);
  const propertyRules = getPropertyRules(rules)
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

  // Runs rules on all responses bodies - this will:
  // - run rules with values from the before spec (this will trigger `removed` rules)
  // - run rules with values from the after spec (this will trigger `added`, `changed` and `requirement` rules)

  // for each rule:
  // - if there is a matches block, check if the current operation matches the rule `matches` condition
  // - if yes, run the user's defined `rule`. for responses, this runs against the response body and response properties
  for (const responseRule of responseRules) {
    if (beforeOperation && beforeSpecification) {
      // Default to after rule context if available
      const ruleContext =
        afterSpecification && afterOperation
          ? createRuleContext({
              operation: afterOperation,
              custom: customRuleContext,
              operationChangeType: operationNode.change?.changeType || null,
              specification: afterSpecification,
              specificationNode: specificationNode,
            })
          : createRuleContext({
              operation: beforeOperation,
              custom: customRuleContext,
              operationChangeType: operationNode.change?.changeType || null,
              specification: beforeSpecification,
              specificationNode: specificationNode,
            });
      const responseAssertions = createResponseBodyAssertions();
      // Register the user's rule definition, this is collected in the responseAssertions object
      responseRule.rule(responseAssertions, ruleContext);

      const beforeResponse = createResponse(
        responseNode,
        'before',
        beforeApiSpec
      );
      if (beforeResponse) {
        for (const beforeBody of beforeResponse.bodies) {
          const matches =
            !responseRule.matches ||
            responseRule.matches(beforeBody, ruleContext);
          const exempted = isExempted(beforeBody.raw, responseRule.name);
          if (matches) {
            // Run the user's rules that have been stored in responseAssertions for body
            results.push(
              ...responseAssertions.body
                .runBefore(
                  beforeBody,
                  responseNode.bodies.get(beforeBody.contentType)?.change ||
                    null,
                  exempted
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
                responseNode.bodies.get(beforeBody.contentType)?.fields.get(key)
                  ?.change || null;

              // Run the user's rules that have been stored in responseAssertions for property
              results.push(
                ...responseAssertions.property
                  .runBefore(property, propertyChange, exempted)
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
      const ruleContext = createRuleContext({
        operation: afterOperation,
        custom: customRuleContext,
        operationChangeType: operationNode.change?.changeType || null,
        specification: afterSpecification,
        specificationNode: specificationNode,
      });
      // Register the user's rule definition, this is collected in the responseAssertions object
      const responseAssertions = createResponseBodyAssertions();
      // Run the user's rules that have been stored in responseAssertions
      responseRule.rule(responseAssertions, ruleContext);

      const maybeBeforeResponse = createResponse(
        responseNode,
        'before',
        beforeApiSpec
      );
      const afterResponse = createResponse(responseNode, 'after', afterApiSpec);
      if (afterResponse) {
        for (const afterBody of afterResponse.bodies) {
          const maybeBeforeBody =
            maybeBeforeResponse?.bodies.find(
              (body) => body.contentType === afterBody.contentType
            ) || null;

          const matches =
            !responseRule.matches ||
            responseRule.matches(afterBody, ruleContext);

          const exempted = isExempted(afterBody.raw, responseRule.name);

          if (matches) {
            // Run the user's rules that have been stored in responseAssertions for body
            results.push(
              ...responseAssertions.body
                .runAfter(
                  maybeBeforeBody,
                  afterBody,
                  responseNode.bodies.get(afterBody.contentType)?.change ||
                    null,
                  exempted
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
                responseNode.bodies.get(afterBody.contentType)?.fields.get(key)
                  ?.change || null;

              // Run the user's rules that have been stored in responseAssertions for property
              results.push(
                ...responseAssertions.property
                  .runAfter(
                    maybeBeforeProperty,
                    property,
                    propertyChange,
                    exempted
                  )
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

  for (const propertyRule of propertyRules) {

  }

  return results;
};
