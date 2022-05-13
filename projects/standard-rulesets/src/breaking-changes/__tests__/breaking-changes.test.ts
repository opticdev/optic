import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { BreakingChangesRuleset } from '../index';

describe('breaking changes ruleset', () => {
  test('valid changes', () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            parameters: [
              {
                name: 'required',
                in: 'query',
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'optional',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'required',
                in: 'header',
                schema: {
                  type: 'string',
                },
              },
            ],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                      },
                    },
                    required: ['id'],
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'response',
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
                      required: ['id'],
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
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            parameters: [
              {
                name: 'required',
                in: 'query',
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'required',
                in: 'header',
                required: true,
                schema: {
                  type: 'string',
                },
              },
            ],
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                      },
                      anotherId: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'response',
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
                        hello: {
                          type: 'number',
                        },
                      },
                      required: ['id', 'name', 'hello'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    for (const result of results) {
      expect(result.passed).toBe(true);
    }
  });

  test('operation removal', () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {},
          },
        },
      },
    };
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      TestHelpers.createEmptySpec()
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test.each(['query', 'cookie'])(
    'required %p parameter added',
    (location: string) => {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              responses: {},
            },
          },
        },
      };
      const afterJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'required',
                  in: location,
                  required: true,
                  schema: {
                    type: 'string',
                  },
                },
              ],
              responses: {},
            },
          },
        },
      };
      const results = TestHelpers.runRulesWithInputs(
        [new BreakingChangesRuleset()],
        beforeJson,
        afterJson
      );
      expect(results.length > 0).toBe(true);

      expect(results).toMatchSnapshot();
      expect(results.some((result) => !result.passed)).toBe(true);
    }
  );

  test.each(['query', 'cookie'])(
    '%p parameter optional to required',
    (location: string) => {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'version',
                  in: location,
                  schema: {
                    type: 'string',
                  },
                },
              ],
              responses: {},
            },
          },
        },
      };
      const afterJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'version',
                  in: location,
                  required: true,
                  schema: {
                    type: 'string',
                  },
                },
              ],
              responses: {},
            },
          },
        },
      };
      const results = TestHelpers.runRulesWithInputs(
        [new BreakingChangesRuleset()],
        beforeJson,
        afterJson
      );
      expect(results.length > 0).toBe(true);

      expect(results).toMatchSnapshot();
      expect(results.some((result) => !result.passed)).toBe(true);
    }
  );

  test.each(['query', 'cookie'])(
    '%p parameter type change',
    (location: string) => {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'version',
                  in: location,
                  schema: {
                    type: 'string',
                  },
                },
              ],
              responses: {},
            },
          },
        },
      };
      const afterJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'version',
                  in: location,
                  schema: {
                    type: 'number',
                  },
                },
              ],
              responses: {},
            },
          },
        },
      };
      const results = TestHelpers.runRulesWithInputs(
        [new BreakingChangesRuleset()],
        beforeJson,
        afterJson
      );
      expect(results.length > 0).toBe(true);

      expect(results).toMatchSnapshot();
      expect(results.some((result) => !result.passed)).toBe(true);
    }
  );

  test('required request property added', () => {
    const beforeJson: OpenAPIV3.Document = {
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
                      id: {
                        type: 'string',
                      },
                    },
                    required: ['id'],
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    };
    const afterJson: OpenAPIV3.Document = {
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
                      id: {
                        type: 'string',
                      },
                      anotherKey: {
                        type: 'string',
                      },
                    },
                    required: ['id', 'anotherKey'],
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    };
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('request property optional to required', () => {
    const beforeJson: OpenAPIV3.Document = {
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
                      id: {
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
    const afterJson: OpenAPIV3.Document = {
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
                      id: {
                        type: 'string',
                      },
                    },
                    required: ['id'],
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    };
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('request property type change', () => {
    const beforeJson: OpenAPIV3.Document = {
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
                      id: {
                        type: 'string',
                      },
                    },
                    required: ['id'],
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    };
    const afterJson: OpenAPIV3.Document = {
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
                      id: {
                        type: 'number',
                      },
                    },
                    required: ['id'],
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    };
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('root request body type change', () => {
    const beforeJson: OpenAPIV3.Document = {
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
                      id: {
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
    const afterJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'string',
                  },
                },
              },
            },
            responses: {},
          },
        },
      },
    };
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('response property removed', () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'response',
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
                      required: ['id'],
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
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                        },
                      },
                      required: ['id'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('response property required to optional', () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                        },
                      },
                      required: ['id'],
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
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
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
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('response property type change', () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
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
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
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
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('root response body type change', () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'number',
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
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'response',
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
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });
});

describe('breaking change ruleset configuration', () => {
  test('breaking changes applies a matches function', () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {},
          },
          post: {
            responses: {},
          },
        },
      },
    };
    const afterJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {},
          },
        },
      },
    };
    const results = TestHelpers.runRulesWithInputs(
      [
        new BreakingChangesRuleset({
          matches: (context) => context.operation.method !== 'post',
        }),
      ],
      beforeJson,
      afterJson
    );
    expect(results.length === 0).toBe(true);
  });
});
