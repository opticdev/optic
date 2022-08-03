import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { NamingChangesRuleset } from '../index';

describe('fromOpticConfig', () => {
  test('invalid configuration', () => {
    const out = NamingChangesRuleset.fromOpticConfig({ applies: 'invalid' });
    expect(out).toEqual(
      '- ruleset/naming/applies must be equal to one of the allowed values'
    );
  });
});

describe('naming changes configuration', () => {
  test('naming change configuration validation', () => {
    // Typescript will generally catch these, but there's no guarantee a user is using TS here.
    expect(() => {
      new NamingChangesRuleset(undefined as any);
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new NamingChangesRuleset({} as any);
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new NamingChangesRuleset({ applies: 'not valid' } as any);
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new NamingChangesRuleset({ applies: 'always', options: {} });
    }).toThrowErrorMatchingSnapshot();

    expect(() => {
      new NamingChangesRuleset({
        applies: 'always',
        options: {
          queryParameters: 'not a valid format' as any,
        },
      });
    }).toThrowErrorMatchingSnapshot();
  });
});

describe('naming changes', () => {
  describe.each([['always'], ['added'], ['addedOrChanged']])(
    'always',
    (applies) => {
      const namingChangeRuleset = new NamingChangesRuleset({
        applies: applies as any,
        options: {
          queryParameters: 'camelCase',
          requestHeaders: 'PascalCase',
          responseHeaders: 'param-case',
          properties: 'snake_case',
        },
      });
      describe('queryParameters', () => {
        test('passing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  parameters: [
                    {
                      name: 'camelCase',
                      in: 'query',
                    },
                  ],
                  responses: {},
                },
              },
            },
          };
          const after: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  parameters: [
                    {
                      name: 'camelCase',
                      in: 'query',
                      description: 'hi',
                    },
                  ],
                  responses: {},
                },
              },
            },
          };
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(true);
          }
        });

        test('failing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  parameters: [
                    {
                      name: 'snake_case',
                      in: 'query',
                    },
                  ],
                  responses: {},
                },
              },
            },
          };
          const after: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  parameters: [
                    {
                      name: 'snake_case',
                      in: 'query',
                      description: 'hi',
                    },
                  ],
                  responses: {},
                },
              },
            },
          };
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(false);
          }
        });
      });

      describe('request property', () => {
        test('passing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  requestBody: {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            user_name: {
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
          const after: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  requestBody: {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            user_name: {
                              type: 'string',
                              description: 'hi',
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
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(true);
          }
        });

        test('failing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  requestBody: {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            userName: {
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
          const after: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  requestBody: {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            userName: {
                              type: 'string',
                              description: 'hi',
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
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(false);
          }
        });
      });

      describe('response property', () => {
        test('passing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
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
                              user_name: {
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
            ...TestHelpers.createEmptySpec(),
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
                              user_name: {
                                type: 'string',
                                description: 'hi',
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
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(true);
          }
        });

        test('failing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
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
                              userName: {
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
            ...TestHelpers.createEmptySpec(),
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
                              userName: {
                                type: 'string',
                                description: 'hi',
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
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(false);
          }
        });
      });

      describe('request header', () => {
        test('passing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  parameters: [
                    {
                      name: 'PascalCase',
                      in: 'header',
                    },
                  ],
                  responses: {},
                },
              },
            },
          };
          const after: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  parameters: [
                    {
                      name: 'PascalCase',
                      in: 'header',
                      description: 'hi',
                    },
                  ],
                  responses: {},
                },
              },
            },
          };
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(true);
          }
        });

        test('failing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  parameters: [
                    {
                      name: 'snake_case',
                      in: 'header',
                    },
                  ],
                  responses: {},
                },
              },
            },
          };
          const after: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  parameters: [
                    {
                      name: 'snake_case',
                      in: 'header',
                      description: 'hi',
                    },
                  ],
                  responses: {},
                },
              },
            },
          };
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(false);
          }
        });
      });

      describe('response header', () => {
        test('passing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  responses: {
                    '200': {
                      description: '',
                      headers: {
                        'param-case': { schema: {} },
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
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  responses: {
                    '200': {
                      description: '',
                      headers: {
                        'param-case': {
                          description: 'hello',
                          schema: {},
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
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(true);
          }
        });

        test('failing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  responses: {
                    '200': {
                      description: '',
                      headers: {
                        camelCase: {
                          schema: {},
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
          const after: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users': {
                get: {
                  responses: {
                    '200': {
                      description: '',
                      headers: {
                        camelCase: {
                          description: 'hello',
                          schema: {},
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
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(false);
          }
        });
      });

      describe('pathComponents', () => {
        const namingChangeRuleset = new NamingChangesRuleset({
          applies: applies as any,
          options: {
            pathComponents: 'param-case',
          },
        });
        test('passing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/user-list/{userId}': {
                get: { responses: {} },
              },
            },
          };
          const after: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/users-list/{userId}': {
                get: { responses: {} },
              },
            },
          };
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );
          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(true);
          }
        });

        test('failing assertion', () => {
          const before: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {},
          };
          const after: OpenAPIV3.Document = {
            ...TestHelpers.createEmptySpec(),
            paths: {
              '/api/usersList/{userId}': {
                get: { responses: {} },
              },
            },
          };
          const beforeJson =
            applies === 'always'
              ? after
              : applies === 'added'
              ? TestHelpers.createEmptySpec()
              : before;
          const afterJson = after;
          const results = TestHelpers.runRulesWithInputs(
            [namingChangeRuleset],
            beforeJson,
            afterJson
          );

          expect(results.length > 0).toBe(true);

          expect(results).toMatchSnapshot();
          for (const result of results) {
            expect(result.passed).toBe(false);
          }
        });
      });
    }
  );
});
