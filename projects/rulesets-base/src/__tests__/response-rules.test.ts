import { jest, test, expect, describe } from '@jest/globals';

import { defaultEmptySpec, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { RuleError } from '../errors';
import { Matchers, RuleRunner } from '../rule-runner';
import { ResponseRule } from '../rules';
import { createRuleInputs } from '../test-helpers';

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
                headers: { isgood: { schema: {} } },
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
                headers: { isgood: { schema: {} } },
                content: {
                  'application/json': {
                    schema: {},
                  },
                },
              },
              '400': {
                description: 'hello',
                headers: { isgood: { schema: {} } },
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
        new ResponseRule({
          name: 'request',
          matches: (response, ruleContext) =>
            ruleContext.operation.method === 'get' &&
            ruleContext.operation.path === '/api/users',
          rule: (responseAssertions) => {
            responseAssertions.header.requirement('triggers test', mockFn);
          },
        }),
      ]);
      await ruleRunner.runRulesWithFacts(createRuleInputs(json, json));
      expect(mockFn.mock.calls.length).toBe(1);
      const responseFromCallArg = mockFn.mock.calls[0][0] as any;
      expect(responseFromCallArg.location.jsonPath).toBe(
        '/paths/~1api~1users/get/responses/200/headers/isgood'
      );
    });

    test('match operation with after context', async () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new ResponseRule({
          name: 'request',
          matches: (response, ruleContext) =>
            ruleContext.operation.raw['x-published'] === true,
          rule: (responseBodyAssertions) => {
            responseBodyAssertions.header.removed('triggers test', mockFn);
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
                      headers: { isgood: { schema: {} } },
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
      expect(responseFromCallArg.location.jsonPath).toBe(
        '/paths/~1api~1users/get/responses/200/headers/isgood'
      );
    });

    test('match response with statusCode', async () => {
      const mockFn = jest.fn();
      const ruleRunner = new RuleRunner([
        new ResponseRule({
          name: 'request',
          matches: (request) => request.statusCode === '400',
          rule: (responseAssertions) => {
            responseAssertions.header.requirement('triggers test', mockFn);
          },
        }),
      ]);
      await ruleRunner.runRulesWithFacts(createRuleInputs(json, json));
      expect(mockFn.mock.calls.length).toBe(1);
      const responseFromCallArg = mockFn.mock.calls[0][0] as any;
      expect(responseFromCallArg.location.jsonPath).toBe(
        '/paths/~1api~1users~1{userId}/get/responses/400/headers/isgood'
      );
      // }
    });
  });

  describe('assertion helpers', () => {
    const ruleName = 'request';
    const ruleRunner = new RuleRunner([
      new ResponseRule({
        name: ruleName,
        rule: (responseAssertions) => {
          responseAssertions.requirement.hasResponseHeaderMatching('isgood', {
            description: Matchers.string,
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
                  headers: { isgood: { description: 'hello', schema: {} } },
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
      };
      const results = await ruleRunner.runRulesWithFacts(
        createRuleInputs(json, json)
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
                  headers: { isnotgood: { description: 'hello', schema: {} } },
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
                  'x-optic-exemptions': [ruleName],
                  description: 'hello',
                  headers: { isnotgood: { description: 'hello', schema: {} } },
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
      };
      const results = await ruleRunner.runRulesWithFacts(
        createRuleInputs(json, json)
      );
      expect(results.length).toBe(1);
      const result = results[0];
      expect(result.exempted).toBe(true);
      expect(result.passed).toBe(false);
    });

    test('inverted assertion', async () => {
      const ruleRunner = new RuleRunner([
        new ResponseRule({
          name: 'request',
          rule: (responseAssertions) => {
            responseAssertions.requirement.not.hasResponseHeaderMatching(
              'isgood',
              {
                description: Matchers.string,
              }
            );
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
                  description: 'hello',
                  headers: { isnotgood: { description: 'hello', schema: {} } },
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
      };
      const results = await ruleRunner.runRulesWithFacts(
        createRuleInputs(json, json)
      );
      expect(results.length > 0).toBe(true);
      expect(results).toMatchSnapshot();
      for (const result of results) {
        expect(result.passed).toBe(true);
      }
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
      test('passing assertion', async () => {
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
      test('passing assertion', async () => {
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
    describe('addedOrChanged', () => {
      const ruleRunner = new RuleRunner([
        new ResponseRule({
          name: 'response header type',
          severity: 'warn',
          rule: (responseAssertions) => {
            responseAssertions.header.addedOrChanged(
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
      test('passing assertion', async () => {
        const beforeJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isgood: {
                        description: 'yes',
                        schema: { type: 'string' },
                      },
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
        const afterJson: OpenAPIV3.Document = {
          ...defaultEmptySpec,
          paths: {
            '/api/users': {
              get: {
                responses: {
                  '200': {
                    description: 'hello',
                    headers: {
                      isgood: {
                        description: 'yes',
                        schema: { type: 'number' },
                      },
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
        const results = await ruleRunner.runRulesWithFacts(
          createRuleInputs(beforeJson, afterJson)
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
      test('passing assertion', async () => {
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
      test('passing assertion', async () => {
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

    test('does not get double called for each body', async () => {
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
                    'application/xml': {
                      schema: {},
                    },
                    'application/json+1': {
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
      expect(results).toMatchSnapshot();
      expect(results.length === 1).toBe(true);
    });
  });
});
