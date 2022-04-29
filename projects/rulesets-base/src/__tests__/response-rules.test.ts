import { defaultEmptySpec, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { RuleError } from '../errors';
import { RuleRunner } from '../rule-runner';
import { ResponseRule } from '../rules';
import { createRuleInputs } from './helpers';

describe('ResponseRule', () => {
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

    test('match operation', () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new ResponseRule({
          name: 'request',
          matches: (response, ruleContext) =>
            ruleContext.operation.method === 'get' &&
            ruleContext.operation.path === '/api/users',
          rule: (responseAssertions) => {
            responseAssertions.body.requirement('triggers test', mockFn);
          },
        }),
      ]);
      ruleRunner.runRulesWithFacts(createRuleInputs(json, json));

      expect(mockFn.mock.calls.length).toBe(1);
      const responseFromCallArg = mockFn.mock.calls[0][0];
      expect(responseFromCallArg.contentType).toBe('application/xml');
      expect(responseFromCallArg.location.jsonPath).toBe(
        '/paths/~1api~1users/get/responses/200'
      );
    });

    test('match response with content type', () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new ResponseRule({
          name: 'request',
          matches: (request) => request.contentType === 'application/json',
          rule: (responseAssertions) => {
            responseAssertions.body.requirement('triggers test', mockFn);
          },
        }),
      ]);
      ruleRunner.runRulesWithFacts(createRuleInputs(json, json));

      expect(mockFn.mock.calls.length).toBe(2);
      const responseFromCallArg = mockFn.mock.calls[0][0];
      expect(responseFromCallArg.contentType).toBe('application/json');
      expect(['200', '400'].includes(responseFromCallArg.statusCode)).toBe(
        true
      );
      expect(responseFromCallArg.location.jsonPath).toMatch(
        /\/paths\/~1api~1users~1{userId}\/get\/responses\/(200|400)/
      );
    });
  });

  describe('body assertions', () => {
    describe('requirement', () => {
      const ruleRunner = new RuleRunner([
        new ResponseRule({
          name: 'response type',
          rule: (responseAssertions) => {
            responseAssertions.body.requirement(
              'must contain a type',
              (response) => {
                if (!response.body.value.flatSchema.type) {
                  throw new RuleError({
                    message: 'response body does not have `type`',
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
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
        const results = ruleRunner.runRulesWithFacts(
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
        new ResponseRule({
          name: 'response type',
          rule: (responseAssertions) => {
            responseAssertions.body.added('must contain a type', (response) => {
              if (!response.body.value.flatSchema.type) {
                throw new RuleError({
                  message: 'response does not have `type`',
                });
              }
            });
          },
        }),
      ]);

      test('passing assertion', () => {
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(defaultEmptySpec, json)
        );
        expect(results.length > 0).toBe(true);

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
        const results = ruleRunner.runRulesWithFacts(
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
        new ResponseRule({
          name: 'response shape',
          rule: (responseAssertions) => {
            responseAssertions.body.changed(
              'must not change root body shape',
              (before, after) => {
                if (
                  before.body.value.flatSchema.type !==
                  after.body.value.flatSchema.type
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

      test('passing assertion', () => {
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
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
        const results = ruleRunner.runRulesWithFacts(
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
        new ResponseRule({
          name: 'request removal',
          rule: (responseAssertions) => {
            responseAssertions.body.removed(
              'cannot remove bodies with array schema',
              (request) => {
                if (request.body.value.flatSchema.type === 'array') {
                  throw new RuleError({
                    message: 'cannot remove bodies with array schema',
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
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
        const results = ruleRunner.runRulesWithFacts(
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

  describe('property assertions', () => {
    describe('requirement', () => {
      const ruleRunner = new RuleRunner([
        new ResponseRule({
          name: 'response type',
          rule: (responseAssertions) => {
            responseAssertions.property.requirement(
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

      test('passing assertion', () => {
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
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
        const results = ruleRunner.runRulesWithFacts(
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
        new ResponseRule({
          name: 'request type',
          rule: (responseAssertions) => {
            responseAssertions.property.requirement(
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

      test('passing assertion', () => {
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(defaultEmptySpec, json)
        );
        expect(results.length > 0).toBe(true);

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
        const results = ruleRunner.runRulesWithFacts(
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
        new ResponseRule({
          name: 'property type',
          rule: (responseAssertions) => {
            responseAssertions.property.changed(
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

      test('passing assertion', () => {
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
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
        const results = ruleRunner.runRulesWithFacts(
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
        new ResponseRule({
          name: 'request removal',
          rule: (responseAssertions) => {
            responseAssertions.property.removed(
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

      test('passing assertion', () => {
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
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
        const results = ruleRunner.runRulesWithFacts(
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

  describe('header assertions', () => {
    describe('requirement', () => {
      const ruleRunner = new RuleRunner([
        new ResponseRule({
          name: 'response header type',
          rule: (responseAssertions) => {
            responseAssertions.header.requirement(
              'must contain a description',
              (property) => {
                if (!property.value.description) {
                  throw new RuleError({
                    message: 'header does not have `description`',
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
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isgood: { description: 'yes' },
                    },
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(json, json)
        );
        expect(results).toMatchSnapshot();
        expect(results.length > 0).toBe(true);
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
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isnotsogood: {},
                    },
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
        const results = ruleRunner.runRulesWithFacts(
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
        new ResponseRule({
          name: 'response header type',
          rule: (responseAssertions) => {
            responseAssertions.header.added(
              'must contain a description',
              (property) => {
                if (!property.value.description) {
                  throw new RuleError({
                    message: 'header does not have `description`',
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
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isgood: { description: 'yes' },
                    },
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(defaultEmptySpec, json)
        );
        expect(results.length > 0).toBe(true);

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
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isnotsogood: {},
                    },
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
        const results = ruleRunner.runRulesWithFacts(
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
        new ResponseRule({
          name: 'header required type',
          rule: (responseAssertions) => {
            responseAssertions.header.changed(
              'must not make header optional -> required',
              (before, after) => {
                if (!before.value.required && after.value.required) {
                  throw new RuleError({
                    message: 'must not make header optional -> required',
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
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isgood: { description: 'yes', required: true },
                    },
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
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isgood: { description: 'yes' },
                    },
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
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
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
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isgood: { description: 'yes' },
                    },
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
        const after: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isgood: { description: 'yes', required: true },
                    },
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
        const results = ruleRunner.runRulesWithFacts(
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
        new ResponseRule({
          name: 'response header removal',
          rule: (responseAssertions) => {
            responseAssertions.header.removed(
              'cannot remove required header',
              (property) => {
                if (property.value.required) {
                  throw new RuleError({
                    message: 'cannot remove required header',
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
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isgood: { description: 'yes' },
                    },
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
                        schema: {},
                      },
                    },
                  },
                },
              },
            },
          },
        };
        const results = ruleRunner.runRulesWithFacts(
          createRuleInputs(before, after)
        );
        expect(results.length > 0).toBe(true);
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
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isgood: { description: 'yes', required: true },
                    },
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
                        schema: {},
                      },
                    },
                  },
                },
              },
            },
          },
        };
        const results = ruleRunner.runRulesWithFacts(
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
