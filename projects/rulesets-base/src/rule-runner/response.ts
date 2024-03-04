import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';

import {
  createOperation,
  createResponse,
  createSpecification,
} from './data-constructors';
import { EndpointNode, ResponseNode, NodeDetail } from './rule-runner-types';
import { createRuleContextWithOperation, isExempted } from './utils';

import { Rule, Ruleset, ResponseRule } from '../rules';
import { AssertionResult, createResponseAssertions } from './assertions';
import { OpenAPIDocument, Operation, Response } from '../types';
import { getResponseRules } from './rule-filters';

const createResponseResult = (
  assertionResult: AssertionResult,
  response: Response,
  operation: Operation,
  rule: ResponseRule
): Result => ({
  type: assertionResult.type,
  severity: assertionResult.severity,
  where: `${operation.method.toUpperCase()} ${operation.path} response ${
    response.statusCode
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

const createResponseHeaderResult = (
  assertionResult: AssertionResult,
  header: string,
  response: Response,
  operation: Operation,
  rule: ResponseRule
): Result => ({
  type: assertionResult.type,
  severity: assertionResult.severity,
  where: `${operation.method.toUpperCase()} ${operation.path} response ${
    response.statusCode
  } response header: ${header}`,
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

export const runResponseRules = ({
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
  const responseRules = getResponseRules(rules);
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

  // Runs rules on all responses  - this will:
  // - run rules with values from the before spec (this will trigger `removed` rules)
  // - run rules with values from the after spec (this will trigger `added`, `changed` and `requirement` rules)

  // for each rule:
  // - if there is a matches block, check if the current operation matches the rule `matches` condition
  // - if yes, run the user's defined `rule`. for responses, this runs against the response and response headers
  for (const responseRule of responseRules) {
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
      const beforeResponse = createResponse(
        responseNode,
        'before',
        beforeApiSpec
      );
      const responseAssertions = createResponseAssertions(
        responseRule.severity
      );
      // Register the user's rule definition, this is collected in the responseAssertions object
      responseRule.rule(responseAssertions, ruleContext);

      if (beforeResponse) {
        const matches =
          !responseRule.matches ||
          responseRule.matches(beforeResponse, ruleContext);

        const exempted = isExempted(beforeResponse.raw, responseRule.name);

        if (matches) {
          // Run the user's rules that have been stored in responseAssertions
          results.push(
            ...responseAssertions
              .runBefore(beforeResponse, responseNode.change, exempted)
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
            const headerChange = responseNode.headers.get(key)?.change || null;

            // Run the user's rules that have been stored in responseAssertions for header
            results.push(
              ...responseAssertions.header
                .runBefore(header, headerChange, exempted)
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
      const maybeBeforeResponse = createResponse(
        responseNode,
        'before',
        beforeApiSpec
      );
      const afterResponse = createResponse(responseNode, 'after', afterApiSpec);
      const responseAssertions = createResponseAssertions(
        responseRule.severity
      );
      // Register the user's rule definition, this is collected in the responseAssertions object
      responseRule.rule(responseAssertions, ruleContext);

      if (afterResponse) {
        const matches =
          !responseRule.matches ||
          responseRule.matches(afterResponse, ruleContext);

        const exempted = isExempted(afterResponse.raw, responseRule.name);

        if (matches) {
          // Run the user's rules that have been stored in responseAssertions
          results.push(
            ...responseAssertions
              .runAfter(
                maybeBeforeResponse,
                afterResponse,
                responseNode.change,
                exempted
              )
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

            const headerChange = responseNode.headers.get(key)?.change || null;

            // Run the user's rules that have been stored in responseAssertions for header
            results.push(
              ...responseAssertions.header
                .runAfter(maybeBeforeHeader, header, headerChange, exempted)
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
  }

  return results;
};
