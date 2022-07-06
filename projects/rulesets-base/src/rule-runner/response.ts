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
  createRuleContext,
  createRulesetMatcher,
  getRuleAliases,
  isExempted,
} from './utils';

import { Rule, Ruleset, ResponseRule } from '../rules';
import {
  assertionLifecycleToText,
  AssertionResult,
  createResponseAssertions,
} from './assertions';
import { Operation, Response } from '../types';

const getResponseRules = (
  rules: (Ruleset | Rule)[]
): (ResponseRule & RulesetData)[] => {
  const responseRule: (ResponseRule & RulesetData)[] = [];
  for (const ruleOrRuleset of rules) {
    if (ResponseRule.isInstance(ruleOrRuleset)) {
      responseRule.push({
        ...ruleOrRuleset,
        aliases: [],
      });
    }

    if (Ruleset.isInstance(ruleOrRuleset)) {
      for (const rule of ruleOrRuleset.rules) {
        if (ResponseRule.isInstance(rule)) {
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

const createResponseResult = (
  assertionResult: AssertionResult,
  response: Response,
  operation: Operation,
  rule: ResponseRule
): Result => ({
  where: `${assertionLifecycleToText(
    assertionResult.type
  )} response status code: ${
    response.statusCode
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

const createResponseHeaderResult = (
  assertionResult: AssertionResult,
  header: string,
  response: Response,
  operation: Operation,
  rule: ResponseRule
): Result => ({
  where: `${assertionLifecycleToText(
    assertionResult.type
  )} response header: ${header} in response status code: ${
    response.statusCode
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
  beforeApiSpec: OpenAPIV3.Document;
  afterApiSpec: OpenAPIV3.Document;
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
      const ruleContext = createRuleContext({
        operation: beforeOperation,
        custom: customRuleContext,
        operationChangeType: operationNode.change?.changeType || null,
        specification: beforeSpecification,
        specificationNode: specificationNode,
      });
      const beforeResponse = createResponse(
        responseNode,
        'before',
        beforeApiSpec
      );
      const responseAssertions = createResponseAssertions();
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
      const ruleContext = createRuleContext({
        operation: afterOperation,
        custom: customRuleContext,
        operationChangeType: operationNode.change?.changeType || null,
        specification: afterSpecification,
        specificationNode: specificationNode,
      });
      const maybeBeforeResponse = createResponse(
        responseNode,
        'before',
        beforeApiSpec
      );
      const afterResponse = createResponse(responseNode, 'after', afterApiSpec);
      const responseAssertions = createResponseAssertions();
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
