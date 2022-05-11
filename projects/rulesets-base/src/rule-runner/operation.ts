import { OpenApiKind, OpenAPIV3, Result } from '@useoptic/openapi-utilities';
import { createOperation, createSpecification } from './data-constructors';
import { RulesetData, EndpointNode, NodeDetail } from './rule-runner-types';
import {
  createRulesetMatcher,
  getRuleAliases,
  createOperationContext,
} from './utils';

import { Rule, Ruleset, OperationRule } from '../rules';
import {
  createOperationAssertions,
  AssertionResult,
  assertionLifecycleToText,
} from './assertions';
import { Operation } from '../types';

const getOperationRules = (
  rules: (Ruleset | Rule)[]
): (OperationRule & RulesetData)[] => {
  const operationRules: (OperationRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (ruleOrRuleset instanceof OperationRule) {
      operationRules.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (ruleOrRuleset instanceof Ruleset) {
      for (const rule of ruleOrRuleset.rules) {
        if (rule instanceof OperationRule) {
          operationRules.push({
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

  return operationRules;
};

const createOperationResult = (
  assertionResult: AssertionResult,
  operation: Operation,
  rule: OperationRule
): Result => ({
  where: `${assertionLifecycleToText(
    assertionResult.type
  )} operation: ${operation.method.toUpperCase()} ${operation.path}`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  received: assertionResult.received,
  expected: assertionResult.expected,
  passed: assertionResult.passed,
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
  where: `${assertionLifecycleToText(assertionResult.type)} ${
    parameter.type
  }: ${parameter.name} in operation: ${parameter.method.toUpperCase()} ${
    parameter.path
  }`,
  isMust: true,
  change: assertionResult.changeOrFact,
  name: rule.name,
  condition: assertionResult.condition,
  received: assertionResult.received,
  expected: assertionResult.expected,
  passed: assertionResult.passed,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

export const runOperationRules = ({
  specification,
  operation,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  specification: NodeDetail<OpenApiKind.Specification>;
  operation: EndpointNode;
  rules: (Ruleset | Rule)[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}): Result[] => {
  const operationRules = getOperationRules(rules);
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
  const results: Result[] = [];

  for (const operationRule of operationRules) {
    if (beforeOperation && beforeSpecification) {
      const beforeRulesContext = createOperationContext({
        operation: beforeOperation,
        custom: customRuleContext,
        operationChangeType: operation.change?.changeType || null,
        specification: beforeSpecification,
        specificationNode: specification,
      });

      if (
        !operationRule.matches ||
        operationRule.matches(beforeOperation, beforeRulesContext)
      ) {
        const operationAssertions = createOperationAssertions();
        // Register the user's rule definition
        operationRule.rule(operationAssertions, beforeRulesContext);

        // Run the user's rules
        results.push(
          ...operationAssertions
            .runBefore(beforeOperation, operation.change)
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
            operation.headerParameters.get(key)?.change || null;

          results.push(
            ...operationAssertions.headerParameter
              .runBefore(beforeParameter, maybeChange)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'header parameter',
                    method: operation.method,
                    path: operation.path,
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
          const maybeChange = operation.pathParameters.get(key)?.change || null;
          results.push(
            ...operationAssertions.pathParameter
              .runBefore(beforeParameter, maybeChange)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'path parameter',
                    method: operation.method,
                    path: operation.path,
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
            operation.queryParameters.get(key)?.change || null;
          results.push(
            ...operationAssertions.queryParameter
              .runBefore(beforeParameter, maybeChange)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'query parameter',
                    method: operation.method,
                    path: operation.path,
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
            operation.cookieParameters.get(key)?.change || null;
          results.push(
            ...operationAssertions.cookieParameter
              .runBefore(beforeParameter, maybeChange)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'cookie parameter',
                    method: operation.method,
                    path: operation.path,
                  },
                  operationRule
                )
              )
          );
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

      if (
        !operationRule.matches ||
        operationRule.matches(afterOperation, afterRulesContext)
      ) {
        const operationAssertions = createOperationAssertions();

        // Register the user's rule definition
        operationRule.rule(operationAssertions, afterRulesContext);

        // Run the user's rules
        results.push(
          ...operationAssertions
            .runAfter(beforeOperation, afterOperation, operation.change)
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
            operation.headerParameters.get(key)?.change || null;

          results.push(
            ...operationAssertions.headerParameter
              .runAfter(maybeBeforeParameter, afterParameter, maybeChange)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'header parameter',
                    method: operation.method,
                    path: operation.path,
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
          const maybeChange = operation.pathParameters.get(key)?.change || null;

          results.push(
            ...operationAssertions.pathParameter
              .runAfter(maybeBeforeParameter, afterParameter, maybeChange)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'path parameter',
                    method: operation.method,
                    path: operation.path,
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
            operation.queryParameters.get(key)?.change || null;

          results.push(
            ...operationAssertions.queryParameter
              .runAfter(maybeBeforeParameter, afterParameter, maybeChange)
              .map((assertionResult) =>
                createParameterResult(
                  assertionResult,
                  {
                    name: key,
                    type: 'query parameter',
                    method: operation.method,
                    path: operation.path,
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
