import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import {
  createOperation,
  createResponse,
  createSpecification,
} from './data-constructors';
import { EndpointNode, ResponseNode, NodeDetail } from './rule-runner-types';
import { createRuleContextWithOperation, isExempted } from './utils';

import { Rule, Ruleset, ResponseBodyRule, PropertyRule } from '../rules';
import {
  AssertionResult,
  createPropertyAssertions,
  createResponseBodyAssertions,
} from './assertions';
import {
  Field,
  OpenAPIDocument,
  Operation,
  ResponseBody,
  Schema,
} from '../types';
import { getPropertyRules, getResponseBodyRules } from './rule-filters';

const createResponseBodyResult = (
  assertionResult: AssertionResult,
  response: ResponseBody,
  operation: Operation,
  rule: ResponseBodyRule
): Result => ({
  type: assertionResult.type,
  severity: assertionResult.severity,
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
  propertyOrSchema: Field | Schema,
  response: ResponseBody,
  operation: Operation,
  rule: ResponseBodyRule | PropertyRule
): Result => ({
  type: assertionResult.type,
  severity: assertionResult.severity,
  where: `${operation.method.toUpperCase()} ${operation.path} response ${
    response.statusCode
  } response body: ${
    response.contentType
  } property ${propertyOrSchema.location.conceptualLocation.jsonSchemaTrail.join('/')}`,
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
  beforeApiSpec: OpenAPIDocument;
  afterApiSpec: OpenAPIDocument;
}) => {
  const results: Result[] = [];
  const responseRules = getResponseBodyRules(rules);
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

  // Runs rules on all responses bodies - this will:
  // - run rules with values from the before spec (this will trigger `removed` rules)
  // - run rules with values from the after spec (this will trigger `added`, `changed` and `requirement` rules)

  // for each rule:
  // - if there is a matches block, check if the current operation matches the rule `matches` condition
  // - if yes, run the user's defined `rule`. for responses, this runs against the response body and response properties
  for (const responseRule of responseRules) {
    if (beforeOperation && beforeSpecification) {
      // Default to after rule context if available
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

      const responseAssertions = createResponseBodyAssertions(
        responseRule.severity
      );
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

            for (const [key, schema] of beforeBody.schemas.entries()) {
              const propertyChange =
                responseNode.bodies
                  .get(beforeBody.contentType)
                  ?.schemas.get(key)?.change || null;

              // Run the user's rules that have been stored in responseAssertions for property
              results.push(
                ...responseAssertions.schema
                  .runBefore(schema, propertyChange, exempted)
                  .map((assertionResult) =>
                    createResponsePropertyResult(
                      assertionResult,
                      schema,
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
      // Register the user's rule definition, this is collected in the responseAssertions object
      const responseAssertions = createResponseBodyAssertions(
        responseRule.severity
      );
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

            for (const [key, schema] of afterBody.schemas.entries()) {
              const maybeBeforeSchema =
                maybeBeforeBody?.schemas.get(key) || null;

              const propertyChange =
                responseNode.bodies.get(afterBody.contentType)?.schemas.get(key)
                  ?.change || null;

              // Run the user's rules that have been stored in responseAssertions for property
              results.push(
                ...responseAssertions.schema
                  .runAfter(maybeBeforeSchema, schema, propertyChange, exempted)
                  .map((assertionResult) =>
                    createResponsePropertyResult(
                      assertionResult,
                      schema,
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
      const beforeResponse = createResponse(
        responseNode,
        'before',
        beforeApiSpec
      );
      if (beforeResponse) {
        for (const beforeBody of beforeResponse.bodies) {
          for (const [key, property] of beforeBody.properties.entries()) {
            const matches =
              !propertyRule.matches ||
              propertyRule.matches(property, ruleContext);

            const exempted = isExempted(property.raw, propertyRule.name);
            const propertyChange =
              responseNode.bodies.get(beforeBody.contentType)?.fields.get(key)
                ?.change || null;
            if (matches) {
              results.push(
                ...propertyAssertions
                  .runBefore(property, propertyChange, exempted)
                  .map((assertionResult) =>
                    createResponsePropertyResult(
                      assertionResult,
                      property,
                      beforeBody,
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

          for (const [key, property] of afterBody.properties.entries()) {
            const maybeBeforeProperty =
              maybeBeforeBody?.properties.get(key) || null;

            const propertyChange =
              responseNode.bodies.get(afterBody.contentType)?.fields.get(key)
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
                    createResponsePropertyResult(
                      assertionResult,
                      property,
                      afterBody,
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
