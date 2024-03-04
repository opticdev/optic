import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';
import { createOperation, createSpecification } from './data-constructors';
import { EndpointNode, NodeDetail } from './rule-runner-types';
import { createRuleContextWithOperation, isExempted } from './utils';

import { Rule, Ruleset, OperationRule } from '../rules';
import { createOperationAssertions, AssertionResult } from './assertions';
import { OpenAPIDocument, Operation } from '../types';
import { getOperationRules } from './rule-filters';

const createOperationResult = (
  assertionResult: AssertionResult,
  operation: Operation,
  rule: OperationRule
): Result => ({
  type: assertionResult.type,
  severity: assertionResult.severity,
  where: `${operation.method.toUpperCase()} ${operation.path}`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  received: assertionResult.received,
  expected: assertionResult.expected,
  passed: assertionResult.passed,
  exempted: assertionResult.exempted,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

const createParameterResult = (
  assertionResult: AssertionResult,
  parameter: {
    type:
      | 'header parameter'
      | 'query parameter'
      | 'path parameter'
      | 'cookie parameter';
    name: string;
    path: string;
    method: string;
  },
  rule: OperationRule
): Result => ({
  type: assertionResult.type,
  severity: assertionResult.severity,
  where: `${parameter.method.toUpperCase()} ${parameter.path} ${
    parameter.type
  }: ${parameter.name}`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  received: assertionResult.received,
  expected: assertionResult.expected,
  passed: assertionResult.passed,
  exempted: assertionResult.exempted,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

export const runOperationRules = ({
  specificationNode,
  operationNode,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  specificationNode: NodeDetail<OpenApiKind.Specification>;
  operationNode: EndpointNode;
  rules: (Ruleset | Rule)[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIDocument;
  afterApiSpec: OpenAPIDocument;
}): Result[] => {
  const operationRules = getOperationRules(rules);
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
  const results: Result[] = [];

  // Runs rules on all operations - this will:
  // - run rules with values from the before spec (this will trigger `removed` rules)
  // - run rules with values from the after spec (this will trigger `added`, `changed` and `requirement` rules)

  // for each rule:
  // - if there is a matches block, check if the current operation matches the rule `matches` condition
  // - if yes, run the user's defined `rule`. for operations, this runs against the operation, headerParameters, queryParameters, pathParameters and cookie parameters
  for (const operationRule of operationRules) {
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

      const matches =
        !operationRule.matches ||
        operationRule.matches(beforeOperation, ruleContext);

      const exempted = isExempted(beforeOperation.raw, operationRule.name);

      if (matches) {
        const operationAssertions = createOperationAssertions(
          operationRule.severity
        );
        // Register the user's rule definition, this is collected in the operationAssertions object
        operationRule.rule(operationAssertions, ruleContext);

        // Run the user's rules that have been stored in operationAssertions
        results.push(
          ...operationAssertions
            .runBefore(beforeOperation, operationNode.change, exempted)
            .map((assertionResult) =>
              createOperationResult(
                assertionResult,
                beforeOperation,
                operationRule
              )
            )
        );

        for (const [
          key,
          beforeParameter,
        ] of beforeOperation.headerParameters.entries()) {
          const maybeChange =
            operationNode.headerParameters.get(key)?.change || null;

          // Run the user's rules that have been stored in operationAssertions for headerParameters
          results.push(
            ...operationAssertions.headerParameter
              .runBefore(beforeParameter, maybeChange, exempted)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'header parameter',
                    method: operationNode.method,
                    path: operationNode.path,
                  },
                  operationRule
                )
              )
          );
        }

        for (const [
          key,
          beforeParameter,
        ] of beforeOperation.pathParameters.entries()) {
          const maybeChange =
            operationNode.pathParameters.get(key)?.change || null;

          // Run the user's rules that have been stored in operationAssertions for pathParameter
          results.push(
            ...operationAssertions.pathParameter
              .runBefore(beforeParameter, maybeChange, exempted)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'path parameter',
                    method: operationNode.method,
                    path: operationNode.path,
                  },
                  operationRule
                )
              )
          );
        }

        for (const [
          key,
          beforeParameter,
        ] of beforeOperation.queryParameters.entries()) {
          const maybeChange =
            operationNode.queryParameters.get(key)?.change || null;

          // Run the user's rules that have been stored in operationAssertions for queryParameter
          results.push(
            ...operationAssertions.queryParameter
              .runBefore(beforeParameter, maybeChange, exempted)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'query parameter',
                    method: operationNode.method,
                    path: operationNode.path,
                  },
                  operationRule
                )
              )
          );
        }

        for (const [
          key,
          beforeParameter,
        ] of beforeOperation.cookieParameters.entries()) {
          const maybeChange =
            operationNode.cookieParameters.get(key)?.change || null;

          // Run the user's rules that have been stored in operationAssertions for cookieParameter
          results.push(
            ...operationAssertions.cookieParameter
              .runBefore(beforeParameter, maybeChange, exempted)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'cookie parameter',
                    method: operationNode.method,
                    path: operationNode.path,
                  },
                  operationRule
                )
              )
          );
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

      const matches =
        !operationRule.matches ||
        operationRule.matches(afterOperation, ruleContext);

      const exempted = isExempted(afterOperation.raw, operationRule.name);

      if (matches) {
        const operationAssertions = createOperationAssertions(
          operationRule.severity
        );

        // Register the user's rule definition, this is collected in the operationAssertions object
        operationRule.rule(operationAssertions, ruleContext);

        // Run the user's rules that have been stored in operationAssertions
        results.push(
          ...operationAssertions
            .runAfter(
              beforeOperation,
              afterOperation,
              operationNode.change,
              exempted
            )
            .map((assertionResult) =>
              createOperationResult(
                assertionResult,
                afterOperation,
                operationRule
              )
            )
        );

        for (const [
          key,
          afterParameter,
        ] of afterOperation.headerParameters.entries()) {
          const maybeBeforeParameter =
            beforeOperation?.headerParameters.get(key) || null;
          const maybeChange =
            operationNode.headerParameters.get(key)?.change || null;

          // Run the user's rules that have been stored in operationAssertions for headerParameter
          results.push(
            ...operationAssertions.headerParameter
              .runAfter(
                maybeBeforeParameter,
                afterParameter,
                maybeChange,
                exempted
              )
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'header parameter',
                    method: operationNode.method,
                    path: operationNode.path,
                  },
                  operationRule
                )
              )
          );
        }

        for (const [
          key,
          afterParameter,
        ] of afterOperation.pathParameters.entries()) {
          const maybeBeforeParameter =
            beforeOperation?.pathParameters.get(key) || null;
          const maybeChange =
            operationNode.pathParameters.get(key)?.change || null;

          // Run the user's rules that have been stored in operationAssertions for pathParameter
          results.push(
            ...operationAssertions.pathParameter
              .runAfter(
                maybeBeforeParameter,
                afterParameter,
                maybeChange,
                exempted
              )
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'path parameter',
                    method: operationNode.method,
                    path: operationNode.path,
                  },
                  operationRule
                )
              )
          );
        }

        for (const [
          key,
          afterParameter,
        ] of afterOperation.queryParameters.entries()) {
          const maybeBeforeParameter =
            beforeOperation?.queryParameters.get(key) || null;
          const maybeChange =
            operationNode.queryParameters.get(key)?.change || null;

          // Run the user's rules that have been stored in operationAssertions for queryParameter
          results.push(
            ...operationAssertions.queryParameter
              .runAfter(
                maybeBeforeParameter,
                afterParameter,
                maybeChange,
                exempted
              )
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'query parameter',
                    method: operationNode.method,
                    path: operationNode.path,
                  },
                  operationRule
                )
              )
          );
        }

        for (const [
          key,
          afterParameter,
        ] of afterOperation.cookieParameters.entries()) {
          const maybeBeforeParameter =
            beforeOperation?.cookieParameters.get(key) || null;
          const maybeChange =
            operationNode.cookieParameters.get(key)?.change || null;

          // Run the user's rules that have been stored in operationAssertions for cookieParameter
          results.push(
            ...operationAssertions.cookieParameter
              .runAfter(
                maybeBeforeParameter,
                afterParameter,
                maybeChange,
                exempted
              )
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'cookie parameter',
                    method: operationNode.method,
                    path: operationNode.path,
                  },
                  operationRule
                )
              )
          );
        }
      }
    }
  }

  return results;
};
