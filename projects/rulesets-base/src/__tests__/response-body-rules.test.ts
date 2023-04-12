import { jest, test, expect, describe } from '@jest/globals';
import { defaultEmptySpec, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { RuleError } from '../errors';
import { RuleRunner } from '../rule-runner';
import { ResponseBodyRule } from '../rules';
import { createRuleInputs } from '../test-helpers';

describe('ResponseBodyRule', () => {
  describe('matches', () => {
    const json: OpenAPIV3.Document = {
      ...defaultEmptySpec,
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'hello',
                content: {
                  'application/xml': {
                    schema: {},
                  },
                },
              },
            },
          },
        },
        '/api/users/{userId}': {
          get: {
            responses: {
              '200': {
                description: 'hello',
                content: {
                  'application/json': {
                    schema: {},
                  },
                },
              },
              '400': {
                description: 'hello',
                content: {
                  'application/json': {
                    schema: {},
                  },
                },
              },
            },
          },
        },
      },
    };

    test('match operation', async () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: 'request',
          matches: (response, ruleContext) =>
            ruleContext.operation.method === 'get' &&
            ruleContext.operation.path === '/api/users',
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.body.requirement('triggers test', mockFn);
          },
        }),
      ]);
      await ruleRunner.runRulesWithFacts(createRuleInputs(json, json));

      expect(mockFn.mock.calls.length).toBe(1);
      const responseFromCallArg = mockFn.mock.calls[0][0] as any;
      expect(responseFromCallArg.contentType).toBe('application/xml');
      expect(responseFromCallArg.location.jsonPath).toBe(
        '/paths/~1api~1users/get/responses/200/content/application~1xml'
      );
    });

    test('match operation with after context', async () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: 'request',
          matches: (response, ruleContext) =>
            ruleContext.operation.raw['x-published'] === true,
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.body.removed('triggers test', mockFn);
          },
        }),
      ]);
      await ruleRunner.runRulesWithFacts(
        createRuleInputs(
          {
            ...defaultEmptySpec,
            paths: {
              '/api/users': {
                get: {
                  responses: {
                    '200': {
                      description: 'hello',
                      content: {
                        'application/xml': {
                          schema: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            ...defaultEmptySpec,
            paths: {
              '/api/users': {
                get: {
                  'x-published': true,
                  responses: {},
                },
              },
            } as any,
          }
        )
      );

      expect(mockFn.mock.calls.length).toBe(1);
      const responseFromCallArg = mockFn.mock.calls[0][0] as any;
      expect(responseFromCallArg.contentType).toBe('application/xml');
      expect(responseFromCallArg.location.jsonPath).toBe(
        '/paths/~1api~1users/get/responses/200/content/application~1xml'
      );
    });

    test('match response with content type', async () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: 'request',
          matches: (request) => request.contentType === 'application/json',
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.body.requirement('triggers test', mockFn);
          },
        }),
      ]);
      await ruleRunner.runRulesWithFacts(createRuleInputs(json, json));

      expect(mockFn.mock.calls.length).toBe(2);
      for (const callArgs of mockFn.mock.calls) {
        const responseFromCallArg = callArgs[0] as any;
        expect(responseFromCallArg.contentType).toBe('application/json');
        expect(['200', '400'].includes(responseFromCallArg.statusCode)).toBe(
          true
        );
        expect(responseFromCallArg.location.jsonPath).toMatch(
          /^\/paths\/~1api~1users~1{userId}\/get\/responses\/(200|400)\/content\/application~1json$/
        );
      }
    });
  });

  describe('body assertions', () => {
    describe('requirement', () => {
      const ruleName = 'response type';
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: ruleName,
          severity: 'warn',
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.body.requirement(
              'must contain a type',
              (response) => {
                if (!response.value.flatSchema.type) {
                  throw new RuleError({
                    message: 'response body does not have `type`',
                  });
                }
              }
            );
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
                          type: 'string',
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
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        schema: {},
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
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });

      test('exemption', async () => {
        const json: any = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    content: {
                      'application/json': {
                        'x-optic-exemptions': [ruleName],
                        schema: {},
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
        expect(results.length).toBe(1);
        const result = results[0];
        expect(result.exempted).toBe(true);
        expect(result.passed).toBe(false);
      });
    });

    describe('added', () => {
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: 'response type',
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.body.added(
              'must contain a type',
              (response) => {
                if (!response.value.flatSchema.type) {
                  throw new RuleError({
                    message: 'response does not have `type`',
                  });
                }
              }
            );
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
                          type: 'string',
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
        expect(results.length > 0).toBe(true);

        expect(results).toMatchSnapshot();
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
                        schema: {},
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
        expect(results.length > 0).toBe(true);

        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('changed', () => {
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: 'response shape',
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.body.changed(
              'must not change root body shape',
              (before, after) => {
                if (
                  before.value.flatSchema.type !== after.value.flatSchema.type
                ) {
                  throw new RuleError({
                    message: 'response must not change type',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', async () => {
        const before: OpenAPIV3.Document = {
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
                          type: 'array',
                          description: '123',
                          items: {
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
        };
        const after: OpenAPIV3.Document = {
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
                          type: 'array',
                          description: '12',
                          items: {
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
        };
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const before: OpenAPIV3.Document = {
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
                          type: 'array',
                          description: '123',
                          items: {
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
        };
        const after: OpenAPIV3.Document = {
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
                          properties: {},
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
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('removed', () => {
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: 'request removal',
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.body.removed(
              'cannot remove bodies with array schema',
              (request) => {
                if (request.value.flatSchema.type === 'array') {
                  throw new RuleError({
                    message: 'cannot remove bodies with array schema',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', async () => {
        const before: OpenAPIV3.Document = {
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
                          type: 'string',
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
            '/api/users': {
              get: {
                responses: {},
              },
            },
          },
        };
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const before: OpenAPIV3.Document = {
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
                          type: 'array',
                          items: {
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('custom matchers', () => {
      describe('matches', () => {
        const ruleRunner = new RuleRunner([
          new ResponseBodyRule({
            name: 'request type',
            rule: (responseAssertions) => {
              responseAssertions.body.addedOrChanged.matches({
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                    },
                  },
                },
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
                      description: '',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                              },
                              name: {
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
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
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
                      description: '',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              notid: {
                                type: 'string',
                              },
                              name: {
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
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(false);
          }
        });

        test('inverted assertion', async () => {
          const ruleRunner = new RuleRunner([
            new ResponseBodyRule({
              name: 'request type',
              rule: (responseAssertions) => {
                responseAssertions.body.added.not.matches({
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                      },
                    },
                  },
                });
              },
            }),
          ]);
          const json: OpenAPIV3.Document = {
            ...defaultEmptySpec,
            paths: {
              '/api/users': {
                get: {
                  responses: {
                    '200': {
                      description: '',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              notid: {
                                type: 'string',
                              },
                              name: {
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
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(true);
          }
        });
      });

      describe('matchesOneOf', () => {
        const ruleRunner = new RuleRunner([
          new ResponseBodyRule({
            name: 'request type',
            rule: (responseAssertions) => {
              responseAssertions.body.added.matchesOneOf([
                {
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                      },
                    },
                  },
                },
                {
                  schema: {
                    type: 'array',
                    items: {},
                  },
                },
              ]);
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
                      description: '',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                              },
                              name: {
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
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
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
                      description: '',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              notid: {
                                type: 'string',
                              },
                              name: {
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
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(false);
          }
        });

        test('inverted assertion', async () => {
          const ruleRunner = new RuleRunner([
            new ResponseBodyRule({
              name: 'request type',
              rule: (responseAssertions) => {
                responseAssertions.body.added.not.matchesOneOf([
                  {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                        },
                      },
                    },
                  },
                  {
                    schema: {
                      type: 'array',
                      items: {},
                    },
                  },
                ]);
              },
            }),
          ]);

          const json: OpenAPIV3.Document = {
            ...defaultEmptySpec,
            paths: {
              '/api/users': {
                get: {
                  responses: {
                    '200': {
                      description: '',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'object',
                            properties: {
                              notid: {
                                type: 'string',
                              },
                              name: {
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
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(true);
          }
        });
      });
    });
  });

  describe('property assertions', () => {
    describe('requirement', () => {
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: 'response type',
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.property.requirement(
              'must contain a type',
              (property) => {
                if (!property.value.flatSchema.type) {
                  throw new RuleError({
                    message: 'field does not have `type`',
                  });
                }
              }
            );
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
                            hello: {
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
                responses: {
                  '200': {
                    description: 'hello',
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
                },
              },
            },
          },
        };
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('added', () => {
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: 'request type',
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.property.requirement(
              'must contain a type',
              (property) => {
                if (!property.value.flatSchema.type) {
                  throw new RuleError({
                    message: 'field does not have `type`',
                  });
                }
              }
            );
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
                            hello: {
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
        expect(results.length > 0).toBe(true);

        expect(results).toMatchSnapshot();
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
                            hello: {},
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
        expect(results.length > 0).toBe(true);

        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('changed', () => {
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: 'property type',
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.property.changed(
              'must not change property type',
              (before, after) => {
                if (
                  before.value.flatSchema.type !== after.value.flatSchema.type
                ) {
                  throw new RuleError({
                    message: 'must not change type',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', async () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: '123',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'array',
                          description: '123',
                          items: {
                            type: 'object',
                            properties: {
                              hello: {
                                type: 'string',
                                format: 'uuid',
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
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: '123',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'array',
                          description: '123',
                          items: {
                            type: 'object',
                            properties: {
                              hello: {
                                type: 'string',
                                format: 'date',
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
          },
        };
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: '123',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'array',
                          description: '123',
                          items: {
                            type: 'object',
                            properties: {
                              hello: {
                                type: 'string',
                                format: 'uuid',
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
          },
        };
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: ' 123',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'array',
                          description: '123',
                          items: {
                            type: 'object',
                            properties: {
                              hello: {
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
          },
        };
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });

    describe('removed', () => {
      const ruleRunner = new RuleRunner([
        new ResponseBodyRule({
          name: 'request removal',
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.property.removed(
              'cannot remove bodies required property',
              (property) => {
                if (property.value.required) {
                  throw new RuleError({
                    message: 'cannot remove bodies with array schema',
                  });
                }
              }
            );
          },
        }),
      ]);

      test('passing assertion', async () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: '123',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            hello: {
                              type: 'string',
                            },
                            goodbye: {
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
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: '123',
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
                },
              },
            },
          },
        };
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(true);
        }
      });

      test('failing assertion', async () => {
        const before: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: '123',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          required: ['goodbye'],
                          properties: {
                            hello: {
                              type: 'string',
                            },
                            goodbye: {
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
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: '123',
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
                },
              },
            },
          },
        };
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
        expect(results).toMatchSnapshot();
        for (const result of results) {
          expect(result.passed).toBe(false);
        }
      });
    });
  });
});
