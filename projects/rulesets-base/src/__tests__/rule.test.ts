import { test, expect, describe } from '@jest/globals';
import { RuleRunner } from '../rule-runner';
import { OperationRule } from '../rules';
import { RuleError } from '../errors';
import {
  OpenAPIV3,
  Severity,
  defaultEmptySpec,
} from '@useoptic/openapi-utilities';
import { createRuleInputs } from '../test-helpers';

describe('severity', () => {
  const json: OpenAPIV3.Document = {
    ...defaultEmptySpec,
    paths: {
      '/api/users': {
        get: {
          description: 'hello',
          responses: {},
        },
      },
    },
  };

  test('setting a severity on a rule', async () => {
    const ruleName = 'operation description';
    const ruleRunner = new RuleRunner([
      new OperationRule({
        name: ruleName,
        severity: 'warn',
        rule: (operationAssertions) => {
          operationAssertions.requirement(() => {
            throw new RuleError({
              message: 'failed',
            });
          });
        },
      }),
    ]);

    const results = await ruleRunner.runRulesWithFacts(
      createRuleInputs(json, json)
    );
    expect(results.length === 1).toBe(true);
    expect(results[0].severity).toBe(Severity.Warn);
    expect(results[0].error).toBeTruthy();
  });

  test('throwing severity in a rule implementation', async () => {
    const ruleName = 'operation description';
    const ruleRunner = new RuleRunner([
      new OperationRule({
        name: ruleName,
        severity: 'warn',
        rule: (operationAssertions) => {
          operationAssertions.requirement(() => {
            throw new RuleError({
              message: 'failed',
              severity: 'info',
            });
          });
        },
      }),
    ]);

    const results = await ruleRunner.runRulesWithFacts(
      createRuleInputs(json, json)
    );
    expect(results.length === 1).toBe(true);
    expect(results[0].severity).toBe(Severity.Info);
    expect(results[0].error).toBeTruthy();
  });
});
