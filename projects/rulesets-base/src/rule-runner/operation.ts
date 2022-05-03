import { OpenAPIV3, Result } from '@useoptic/openapi-utilities';
import { createOperation } from './data-constructors';
import { RulesetData, EndpointNode } from './rule-runner-types';
import {
  createRulesetMatcher,
  getRuleAliases,
  createAfterOperationContext,
  createBeforeOperationContext,
} from './utils';

import { Ruleset, OperationRule } from '../rules';
import {
  createOperationAssertions,
  AssertionResult,
  assertionLifecycleToText,
} from './assertions';
import { Operation, Rule } from '../types';

const getOperationRules = (rules: Rule[]): (OperationRule & RulesetData)[] => {
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
  passed: assertionResult.passed,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

const createParameterResult = (
  assertionResult: AssertionResult,
  parameter: {
    type: 'header parameter' | 'query parameter' | 'path parameter';
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
  passed: assertionResult.passed,
  error: assertionResult.error,
  docsLink: rule.docsLink,
  isShould: false,
});

export const runOperationRules = ({
  operation,
  rules,
  customRuleContext,
  beforeApiSpec,
  afterApiSpec,
}: {
  operation: EndpointNode;
  rules: Rule[];
  customRuleContext: any;
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
}): Result[] => {
  const operationRules = getOperationRules(rules);
  const beforeOperation = createOperation(operation, 'before', beforeApiSpec);
  const afterOperation = createOperation(operation, 'after', afterApiSpec);
  const results: Result[] = [];

  for (const operationRule of operationRules) {
    if (beforeOperation) {
      const beforeRulesContext = createBeforeOperationContext(
        beforeOperation,
        customRuleContext
      );

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
      }
    }

    if (afterOperation) {
      const afterRulesContext = createAfterOperationContext(
        afterOperation,
        customRuleContext,
        operation.change?.changeType || null
      );

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
                    type: 'header parameter',
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
