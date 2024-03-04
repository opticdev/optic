import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import {
  createOperation,
  createRequest,
  createSpecification,
} from './data-constructors';
import { EndpointNode, RequestNode, NodeDetail } from './rule-runner-types';
import { createRuleContextWithOperation, isExempted } from './utils';

import { Rule, Ruleset, RequestRule, PropertyRule } from '../rules';
import {
  AssertionResult,
  createPropertyAssertions,
  createRequestAssertions,
} from './assertions';
import {
  Field,
  OpenAPIDocument,
  Operation,
  RequestBody,
  Schema,
} from '../types';
import { getPropertyRules, getRequestRules } from './rule-filters';

const createRequestBodyResult = (
  assertionResult: AssertionResult,
  request: RequestBody,
  operation: Operation,
  rule: RequestRule
): Result => ({
  type: assertionResult.type,
  severity: assertionResult.severity,
  where: `${operation.method.toUpperCase()} ${operation.path} request body: ${
    request.contentType
  }`,
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
  property: Field | Schema,
  request: RequestBody,
  operation: Operation,
  rule: RequestRule | PropertyRule
): Result => ({
  type: assertionResult.type,
  severity: assertionResult.severity,
  where: `${operation.method.toUpperCase()} ${operation.path} request body: ${
    request.contentType
  } property: ${property.location.conceptualLocation.jsonSchemaTrail.join(
    '/'
  )}`,
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
  beforeApiSpec: OpenAPIDocument;
  afterApiSpec: OpenAPIDocument;
}) => {
  const results: Result[] = [];
  const requestRules = getRequestRules(rules);
  const propertyRules = getPropertyRules(rules);
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
      const ruleContext = createRuleContextWithOperation(
        {
          node: specificationNode,
          before: beforeSpecification,
          after: afterSpecification,
        },
        {
          node: operationNode,
          before: beforeOperation,
          after: afterOperation,
        },
        customRuleContext
      );
      const requestAssertions = createRequestAssertions(requestRule.severity);
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

            for (const [key, schema] of beforeRequest.schemas.entries()) {
              const propertyChange =
                requestNode.bodies
                  .get(beforeRequest.contentType)
                  ?.schemas.get(key)?.change || null;

              // Run the user's rules that have been stored in responseAssertions for property
              results.push(
                ...requestAssertions.schema
                  .runBefore(schema, propertyChange, exempted)
                  .map((assertionResult) =>
                    createRequestPropertyResult(
                      assertionResult,
                      schema,
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
      const ruleContext = createRuleContextWithOperation(
        {
          node: specificationNode,
          before: beforeSpecification,
          after: afterSpecification,
        },
        {
          node: operationNode,
          before: beforeOperation,
          after: afterOperation,
        },
        customRuleContext
      );
      const requestAssertions = createRequestAssertions(requestRule.severity);
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

            for (const [key, schema] of afterRequest.schemas.entries()) {
              const maybeBeforeSchema =
                maybeBeforeRequest?.schemas.get(key) || null;

              const propertyChange =
                requestNode.bodies
                  .get(afterRequest.contentType)
                  ?.schemas.get(key)?.change || null;

              // Run the user's rules that have been stored in responseAssertions for property
              results.push(
                ...requestAssertions.schema
                  .runAfter(maybeBeforeSchema, schema, propertyChange, exempted)
                  .map((assertionResult) =>
                    createRequestPropertyResult(
                      assertionResult,
                      schema,
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

  for (const propertyRule of propertyRules) {
    if (beforeOperation && beforeSpecification) {
      const ruleContext = createRuleContextWithOperation(
        {
          node: specificationNode,
          before: beforeSpecification,
          after: afterSpecification,
        },
        {
          node: operationNode,
          before: beforeOperation,
          after: afterOperation,
        },
        customRuleContext
      );
      const propertyAssertions = createPropertyAssertions(
        propertyRule.severity
      );
      // // Register the user's rule definition, this is collected in the propertyAssertions object
      propertyRule.rule(propertyAssertions, ruleContext);

      for (const contentType of requestNode.bodies.keys()) {
        const beforeRequest = createRequest(
          requestNode,
          contentType,
          'before',
          beforeApiSpec
        );
        if (beforeRequest) {
          for (const [key, property] of beforeRequest.properties.entries()) {
            const propertyChange =
              requestNode.bodies.get(contentType)?.fields.get(key)?.change ||
              null;
            const matches =
              !propertyRule.matches ||
              propertyRule.matches(property, ruleContext);

            const exempted = isExempted(property.raw, propertyRule.name);
            if (matches) {
              results.push(
                ...propertyAssertions
                  .runBefore(property, propertyChange, exempted)
                  .map((assertionResult) =>
                    createRequestPropertyResult(
                      assertionResult,
                      property,
                      beforeRequest,
                      beforeOperation,
                      propertyRule
                    )
                  )
              );
            }
          }
        }
      }
    }

    if (afterOperation && afterSpecification) {
      const ruleContext = createRuleContextWithOperation(
        {
          node: specificationNode,
          before: beforeSpecification,
          after: afterSpecification,
        },
        {
          node: operationNode,
          before: beforeOperation,
          after: afterOperation,
        },
        customRuleContext
      );
      // Register the user's rule definition, this is collected in the propertyAssertions object
      const propertyAssertions = createPropertyAssertions(
        propertyRule.severity
      );
      // Run the user's rules that have been stored in propertyAssertions
      propertyRule.rule(propertyAssertions, ruleContext);
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
          for (const [key, property] of afterRequest.properties.entries()) {
            const maybeBeforeProperty =
              maybeBeforeRequest?.properties.get(key) || null;

            const propertyChange =
              requestNode.bodies.get(afterRequest.contentType)?.fields.get(key)
                ?.change || null;
            const matches =
              !propertyRule.matches ||
              propertyRule.matches(property, ruleContext);

            const exempted = isExempted(property.raw, propertyRule.name);
            if (matches) {
              // Run the user's rules that have been stored in propertyAssertions for property
              results.push(
                ...propertyAssertions
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
                      propertyRule
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
