import { test, expect, describe } from '@jest/globals';
import { RuleRunner } from '../rule-runner';
import { SpectralRule } from '../extended-rules/spectral-rule';
import { undefined as SpectralUndefinedFunc } from '@stoplight/spectral-functions';
import {
  Spectral,
  RulesetDefinition as SpectralRulesetDefinition,
} from '@stoplight/spectral-core';
import { oas } from '@stoplight/spectral-rulesets';
import { OpenAPIV3, defaultEmptySpec, diff } from '@useoptic/openapi-utilities';

const spectral = new Spectral();
spectral.setRuleset({
  extends: [[oas as SpectralRulesetDefinition, 'all']],
  rules: {
    'operation-description': 'error',
  },
});

describe('spectral rule test', () => {
  test('runs spectral rules on added', async () => {
    const ruleRunner = new RuleRunner([
      new SpectralRule({
        name: 'spectral-rules',
        spectral,
        applies: 'added',
      }),
    ]);
    const before: OpenAPIV3.Document = { ...defaultEmptySpec };
    const after: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      paths: {
        '/api': {
          get: {
            responses: {},
          },
        },
      },
    };
    const diffs = diff(before, after);
    const resultsWithChanges = await ruleRunner.runRules({
      diffs,
      fromSpec: before,
      toSpec: after,
      context: {},
    });

    expect(resultsWithChanges.length > 0).toBe(true);
    expect(resultsWithChanges.every((r) => r.passed)).toBe(false);
    expect(resultsWithChanges).toMatchSnapshot();

    const resultsAgainstSelf = await ruleRunner.runRules({
      diffs: [],
      fromSpec: after,
      toSpec: after,
      context: {},
    });
    expect(resultsAgainstSelf.length === 0).toBe(true);
  });

  test('runs spectral rules on addedOrChanged', async () => {
    const spectral = new Spectral();
    spectral.setRuleset({
      extends: [],
      rules: {
        'this-rule': {
          description: 'readOnly is not supported by API Gateway',
          severity: 'error',
          given: '$..readOnly',
          then: [
            {
              function: SpectralUndefinedFunc,
            },
          ],
        },
      },
    });

    const ruleRunner = new RuleRunner([
      new SpectralRule({
        name: 'spectral-rules',
        spectral,
        applies: 'addedOrChanged',
      }),
    ]);
    const before: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      paths: {
        '/api': {
          get: {
            responses: {
              '200': {
                description: '200',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        example: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const after: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      paths: {
        '/api': {
          get: {
            responses: {
              '200': {
                description: '200',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        example: {
                          type: 'string',
                          readOnly: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const diffs = diff(before, after);
    const resultsWithChanges = await ruleRunner.runRules({
      diffs,
      fromSpec: before,
      toSpec: after,
      context: {},
    });

    expect(resultsWithChanges).toMatchSnapshot();
  });

  test('can use matches', async () => {
    const ruleRunner = new RuleRunner([
      new SpectralRule({
        name: 'spectral-rules',
        spectral,
        applies: 'always',
        matches: (context) => context.operation.method === 'get',
      }),
    ]);

    const spec: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      paths: {
        '/api': {
          get: {
            responses: {},
          },
          post: {
            responses: {},
          },
        },
      },
    };

    const results = await ruleRunner.runRules({
      diffs: [],
      fromSpec: spec,
      toSpec: spec,
      context: {},
    });
    expect(results.length > 0).toBe(true);
    expect(
      results.filter((r) => /post/i.test(r.location.jsonPath)).length
    ).toBe(0);
    expect(results.every((r) => r.passed)).toBe(false);
    expect(results).toMatchSnapshot();
  });
});
