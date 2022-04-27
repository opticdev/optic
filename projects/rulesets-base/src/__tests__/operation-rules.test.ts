import { defaultEmptySpec, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { RuleError } from '../errors';
import { RuleRunner } from '../rule-runner';
import { OperationRule } from '../rules';
import { createRuleInputs } from './helpers';

describe('operation', () => {
  test('matches', () => {
    const json: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      paths: {
        '/api/users': {
          get: {
            description: 'hello',
            responses: {},
          },
          post: {
            responses: {},
          },
        },
        '/api/users/{userId}': {
          get: {
            description: 'a',
            responses: {},
          },
          post: {
            responses: {},
          },
        },
      },
    };
    const mockFn = jest.fn();
    const ruleRunner = new RuleRunner([
      new OperationRule({
        name: 'operation description',
        matches: (operation) => operation.method === 'get',
        rule: (operationAssertions) => {
          operationAssertions.requirement('must contain a description', mockFn);
        },
      }),
    ]);
    ruleRunner.runRulesWithFacts(createRuleInputs(json, json));

    expect(mockFn.mock.calls.length).toBe(2);
    const operationCalled = mockFn.mock.calls.map(
      (call) => `${call[0].method} ${call[0].path}`
    );

    for (const op of [`get /api/users/{userId}`, `get /api/users`]) {
      expect(operationCalled.includes(op)).toBe(true);
    }
  });

  describe('assertions', () => {
    describe('requirement', () => {
      const ruleRunner = new RuleRunner([
        new OperationRule({
          name: 'operation description',
          rule: (operationAssertions) => {
            operationAssertions.requirement(
              'must contain a description',
              (operation) => {
                if (!operation.value['description']) {
                  throw new RuleError({
                    message: 'operation does not have `description`',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', () => {
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', () => {
        const json: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('added', () => {
      const ruleRunner = new RuleRunner([
        new OperationRule({
          name: 'operation description',
          rule: (operationAssertions) => {
            operationAssertions.added(
              'must contain a description',
              (operation) => {
                if (!operation.value['description']) {
                  throw new RuleError({
                    message: 'operation does not have `description`',
                  });
                }
              }
            );
          },
        }),
      ]);
      test('passing assertion', () => {
        const beforeJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };
        const afterJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
              post: {
                description: 'hello',
                responses: {},
              },
            },
          },
        };
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(beforeJson, afterJson)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', () => {
        const beforeJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {},
        };
        const afterJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(beforeJson, afterJson)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('changed', () => {
      const ruleRunner = new RuleRunner([
        new OperationRule({
          name: 'operation operationId',
          rule: (operationAssertions) => {
            operationAssertions.changed(
              'must not change an operationId',
              (before, after) => {
                if (
                  before.value['operationId'] &&
                  before.value['operationId'] !== after.value['operationId']
                ) {
                  throw new RuleError({
                    message: 'cannot change operationId',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                operationId: 'get-users',
                responses: {},
              },
            },
          },
        };
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                operationId: 'get-users',
                responses: {},
              },
            },
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                operationId: 'get-users-changed',
                responses: {},
              },
            },
          },
        };
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('removed', () => {
      const ruleRunner = new RuleRunner([
        new OperationRule({
          name: 'operation removal',
          rule: (operationAssertions) => {
            operationAssertions.removed(
              'must not remove an operation',
              (operation) => {
                throw new RuleError({
                  message: 'cannot remove an operation',
                });
              }
            );
          },
        }),
      ]);

      test('passing assertion', () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                operationId: 'get-users',
                responses: {},
              },
            },
          },
        };
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {},
        };
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });
  });

  describe.each([
    ['headerParameter', 'header'],
    ['queryParameter', 'query'],
    ['pathParameter', 'path'],
  ])('%s assertions', (parameterKey, parameter) => {
    describe('requirement', () => {
      const ruleRunner = new RuleRunner([
        new OperationRule({
          name: 'parameter description',
          rule: (operationAssertions) => {
            operationAssertions[parameterKey].requirement(
              'must contain a description',
              (parameter) => {
                if (!parameter.value['description']) {
                  throw new RuleError({
                    message: 'parameter does not have `description`',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', () => {
        const json: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                parameters: [
                  {
                    name: 'hello',
                    in: parameter,
                    description: 'hello',
                  },
                ],
                responses: {},
              },
            },
          },
        };

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', () => {
        const json: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                parameters: [
                  {
                    name: 'hello',
                    in: parameter,
                  },
                ],
                responses: {},
              },
            },
          },
        };

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('added', () => {
      const ruleRunner = new RuleRunner([
        new OperationRule({
          name: 'parameter description',
          rule: (operationAssertions) => {
            operationAssertions[parameterKey].added(
              'must contain a description',
              (parameter) => {
                if (!parameter.value['description']) {
                  throw new RuleError({
                    message: 'parameter does not have `description`',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                parameters: [
                  {
                    name: 'new-param',
                    in: parameter,
                    description: 'hello',
                  },
                ],
                responses: {},
              },
            },
          },
        };

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                parameters: [
                  {
                    name: 'new-param',
                    in: parameter,
                  },
                ],
                responses: {},
              },
            },
          },
        };

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('changed', () => {
      const ruleRunner = new RuleRunner([
        new OperationRule({
          name: 'optional to required parameter',
          rule: (operationAssertions) => {
            operationAssertions[parameterKey].changed(
              'must not make parameter required',
              (before, after) => {
                if (!before.value.required && after.value.required) {
                  throw new RuleError({
                    message: 'cannot make parameter required',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                parameters: [
                  {
                    name: 'new-param',
                    in: parameter,
                    required: true,
                  },
                ],
                responses: {},
              },
            },
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                parameters: [
                  {
                    name: 'new-param',
                    in: parameter,
                  },
                ],
                responses: {},
              },
            },
          },
        };

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                parameters: [
                  {
                    name: 'new-param',
                    in: parameter,
                  },
                ],
                responses: {},
              },
            },
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                parameters: [
                  {
                    name: 'new-param',
                    in: parameter,
                    required: true,
                  },
                ],
                responses: {},
              },
            },
          },
        };

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('removed', () => {
      const ruleRunner = new RuleRunner([
        new OperationRule({
          name: 'removed parameters',
          rule: (operationAssertions) => {
            operationAssertions[parameterKey].removed(
              'cannot remove a required parameter',
              (parameter) => {
                if (parameter.value.required) {
                  throw new RuleError({
                    message: 'required parameter cannot be removed',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                parameters: [
                  {
                    name: 'new-param',
                    in: parameter,
                  },
                ],
                responses: {},
              },
            },
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                parameters: [
                  {
                    name: 'new-param',
                    in: parameter,
                    required: true,
                  },
                ],
                responses: {},
              },
            },
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };

        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });
  });
});
