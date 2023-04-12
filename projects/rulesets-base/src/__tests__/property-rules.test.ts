import { jest, test, expect, describe } from '@jest/globals';
import { defaultEmptySpec, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { RuleError } from '../errors';
import { RuleRunner } from '../rule-runner';
import { PropertyRule } from '../rules';
import { createRuleInputs } from '../test-helpers';

describe('PropertyRule', () => {
  describe('matches', () => {
    const json: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      paths: {
        '/api/users': {
          get: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      goodbye: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            responses: {},
          },
        },
        '/api/users/{userId}': {
          get: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      hello: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    };

    test('matches property', async () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new PropertyRule({
          name: 'property',
          matches: (_, ruleContext) =>
            ruleContext.operation.method === 'get' &&
            ruleContext.operation.path === '/api/users/{userId}',
          rule: (propertyAssertions) => {
            propertyAssertions.requirement(mockFn);
          },
        }),
      ]);
      await ruleRunner.runRulesWithFacts(createRuleInputs(json, json));

      expect(mockFn.mock.calls.length).toBe(1);
      const propertyFromCallArg = mockFn.mock.calls[0][0] as any;
      expect(propertyFromCallArg.value.key).toBe('hello');
    });
  });

  describe('assertions', () => {
    describe('requirement', () => {
      const ruleRunner = new RuleRunner([
        new PropertyRule({
          name: 'property',
          rule: (propertyAssertions) => {
            propertyAssertions.requirement((property) => {
              if (!property.value.flatSchema.type) {
                throw new RuleError({
                  message: 'field does not have `type`',
                });
              }
            });
          },
        }),
      ]);

      test('passing assertion', async () => {
        const json: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          hello: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const json: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          hello: {},
                        },
                      },
                    },
                  },
                },
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {},
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('added', () => {
      const ruleRunner = new RuleRunner([
        new PropertyRule({
          name: 'property',
          severity: 'info',
          rule: (propertyAssertions) => {
            propertyAssertions.added((property) => {
              if (!property.value.flatSchema.type) {
                throw new RuleError({
                  message: 'field does not have `type`',
                });
              }
            });
          },
        }),
      ]);

      test('passing assertion', async () => {
        const json: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          hello: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(defaultEmptySpec, json)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const json: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          hello: {},
                        },
                      },
                    },
                  },
                },
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {},
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(defaultEmptySpec, json)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('addedOrChanged', () => {
      const ruleRunner = new RuleRunner([
        new PropertyRule({
          name: 'property',
          rule: (propertyAssertions) => {
            propertyAssertions.addedOrChanged((property) => {
              if (!property.value.flatSchema.type) {
                throw new RuleError({
                  message: 'field does not have `type`',
                });
              }
            });
          },
        }),
      ]);

      test('passing assertion', async () => {
        const beforeJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
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
        const afterJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          hello: {
                            type: 'string',
                          },
                        },
                      },
                    },
                  },
                },
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
                              type: 'string',
                              description: 'blah',
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(beforeJson, afterJson)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const beforeJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {},
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
        const afterJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          hello: {},
                        },
                      },
                    },
                  },
                },
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
                              description: 'blah',
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(beforeJson, afterJson)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('changed', () => {
      const ruleRunner = new RuleRunner([
        new PropertyRule({
          name: 'property',
          rule: (propertyAssertions) => {
            propertyAssertions.changed(
              'must not change type',
              (before, after) => {
                if (
                  before.value.flatSchema.type !== after.value.flatSchema.type
                ) {
                  throw new RuleError({
                    message: 'field `type` is changed',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', async () => {
        const beforeJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
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
        const afterJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
                              type: 'string',
                              description: 'blah',
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(beforeJson, afterJson)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const beforeJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
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
        const afterJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
                              type: 'number',
                              description: 'blah',
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(beforeJson, afterJson)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('removed', () => {
      const ruleRunner = new RuleRunner([
        new PropertyRule({
          name: 'property',
          rule: (propertyAssertions) => {
            propertyAssertions.removed((property) => {
              if (property.value.flatSchema.type === 'number') {
                throw new RuleError({
                  message: 'cannot remove fields with type: number',
                });
              }
            });
          },
        }),
      ]);

      test('passing assertion', async () => {
        const json: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, defaultEmptySpec)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const json: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            goodthings: {
                              type: 'number',
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, defaultEmptySpec)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });
  });
});
