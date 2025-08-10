import { test, expect, describe } from '@jest/globals';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { BreakingChangesRuleset } from '../index';

describe('fromOpticConfig', () => {
  test('invalid configuration', async () => {
    const out = await BreakingChangesRuleset.fromOpticConfig({
      exclude_operations_with_extension: 12,
    });
    expect(out)
      .toEqual(`- ruleset/breaking-changes/exclude_operations_with_extension must be string
- ruleset/breaking-changes/exclude_operations_with_extension must be array
- ruleset/breaking-changes/exclude_operations_with_extension must be array
- ruleset/breaking-changes/exclude_operations_with_extension must match exactly one schema in oneOf`);
  });

  test('valid config', async () => {
    const out = await BreakingChangesRuleset.fromOpticConfig({
      exclude_operations_with_extension: 'x-legacy',
      docs_link: 'asdasd.com',
      severity: 'warn',
    });

    expect(out).toBeInstanceOf(BreakingChangesRuleset);
  });

  test('valid config with array', async () => {
    const out = await BreakingChangesRuleset.fromOpticConfig({
      exclude_operations_with_extension: ['x-legacy', 'x-meta'],
      docs_link: 'asdasd.com',
      severity: 'warn',
    });

    expect(out).toBeInstanceOf(BreakingChangesRuleset);
  });

  test('valid config with exclude_operations_with_extension as object', async () => {
    const out = await BreakingChangesRuleset.fromOpticConfig({
      exclude_operations_with_extension: [
        {
          'x-stability': ['beta', 'alpha', 'draft'],
        },
      ],
    });

    expect(out).toBeInstanceOf(BreakingChangesRuleset);
  });

  test('does not throw breaking change if semvar has updated', async () => {
    const out = await BreakingChangesRuleset.fromOpticConfig({
      skip_when_major_version_changes: true,
    });

    if (out instanceof BreakingChangesRuleset) {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        info: { title: 'Empty', version: '1.0.0' },
        paths: {
          '/api/users': {
            get: {
              responses: {},
            },
          },
        },
      };
      const results = await TestHelpers.runRulesWithInputs(
        [out],
        beforeJson,
        TestHelpers.createEmptySpec()
      );

      expect(results.length === 0).toBe(true);
    }
  });
  test('does throws breaking change if semvar flag false ', async () => {
    const out = await BreakingChangesRuleset.fromOpticConfig({
      skip_when_major_version_changes: false,
    });

    if (out instanceof BreakingChangesRuleset) {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        info: { title: 'Empty', version: '1.0.0' },
        paths: {
          '/api/users': {
            get: {
              responses: {},
            },
          },
        },
      };
      const results = await TestHelpers.runRulesWithInputs(
        [out],
        beforeJson,
        TestHelpers.createEmptySpec()
      );

      expect(results.length > 0).toBe(true);
    }
  });
});

describe('breaking changes ruleset', () => {
  test('valid changes', async () => {
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
                required: true,
                schema: {
                  type: 'string',
                },
              },
              {
                name: 'enum-widening',
                in: 'cookie',
                schema: {
                  type: 'number',
                  enum: [1, 2],
                },
              },
              {
                name: 'enum-removal',
                in: 'header',
                schema: {
                  type: 'number',
                  enum: [1, 2],
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
              {
                name: 'enum-widening',
                in: 'cookie',
                schema: {
                  type: 'number',
                  enum: [1, 2, 3],
                },
              },
              {
                name: 'enum-removal',
                in: 'header',
                schema: {
                  type: 'number',
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
    const results = await TestHelpers.runRulesWithInputs(
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

  test('operation removal', async () => {
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
    const results = await TestHelpers.runRulesWithInputs(
      [
        new BreakingChangesRuleset({
          severity: 'info',
        }),
      ],
      beforeJson,
      TestHelpers.createEmptySpec()
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('required request property added', async () => {
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
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('request property optional to required', async () => {
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
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('request property type change', async () => {
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
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('root request body type change', async () => {
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
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('response property removed', async () => {
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
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('response property required to optional', async () => {
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
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('response property type change', async () => {
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
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('root response body type change', async () => {
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
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('valid request union type transition', async () => {
    const beforeJson: any = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                        },
                        required: ['id'],
                      },
                    ],
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'response',
                content: {
                  'application/json': {
                    schema: { type: 'string' },
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
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
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
                    schema: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.every((result) => result.passed)).toBe(true);
  });

  test('valid response union type transition', async () => {
    const beforeJson: any = {
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
                        id: { type: 'string' },
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
                      oneOf: [
                        { type: 'number' },
                        {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                          },
                          required: ['id', 'name'],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.every((result) => result.passed)).toBe(true);
  });

  test('valid union type refactor', async () => {
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
                      oneOf: [
                        { type: 'number' },
                        {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                          },
                          required: ['id'],
                        },
                        {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                          },
                          required: ['id', 'name'],
                        },
                      ],
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
                      oneOf: [
                        { type: 'number' },
                        {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                          },
                          required: ['id', 'name'],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.every((result) => result.passed)).toBe(true);
  });

  test('invalid union type transition', async () => {
    const beforeJson: any = {
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
                      type: ['number', 'object'],
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                      required: ['id', 'name'],
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
                      oneOf: [
                        { type: 'number' },
                        {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('invalid union type enum transition in request', async () => {
    const beforeJson: any = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: ['number', 'object'],
                    properties: {
                      id: { type: 'string' },
                      status: { type: 'string', enum: ['online', 'offline'] },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'response',
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
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      { type: 'number' },
                      {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          status: {
                            type: 'string',
                            enum: ['online'],
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
            responses: {
              '200': {
                description: 'response',
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('invalid union type enum transition in response', async () => {
    const beforeJson: any = {
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
                      type: ['number', 'object'],
                      properties: {
                        id: { type: 'string' },
                        status: { type: 'string', enum: ['online'] },
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
                      oneOf: [
                        { type: 'number' },
                        {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            status: {
                              type: 'string',
                              enum: ['online', 'offline'],
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
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
  test('breaking changes applies a matches function for string extension', async () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {},
          },
          post: {
            'x-legacy': true,
            responses: {},
          } as any,
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
    const results = await TestHelpers.runRulesWithInputs(
      [
        (await BreakingChangesRuleset.fromOpticConfig({
          exclude_operations_with_extension: 'x-legacy',
        })) as any,
      ],
      beforeJson,
      afterJson
    );
    expect(results.length).toBe(0);
  });

  test('breaking changes applies a matches function for object extension value match', async () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {},
          },
          post: {
            'x-stability-level': 'draft',
            responses: {},
          } as any,
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
    const results = await TestHelpers.runRulesWithInputs(
      [
        (await BreakingChangesRuleset.fromOpticConfig({
          exclude_operations_with_extension: [
            { 'x-stability-level': ['draft'] },
          ],
        })) as any,
      ],
      beforeJson,
      afterJson
    );
    expect(results.length).toBe(0);
  });

  test('breaking changes applies a matches function for object extension value mismatch', async () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {},
          },
          post: {
            'x-stability-level': 'stable',
            responses: {},
          } as any,
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
    const results = await TestHelpers.runRulesWithInputs(
      [
        (await BreakingChangesRuleset.fromOpticConfig({
          exclude_operations_with_extension: [
            { 'x-stability-level': ['draft'] },
          ],
        })) as any,
      ],
      beforeJson,
      afterJson
    );
    expect(results.length).toEqual(1);
  });

  test('breaking changes applies a matches function for object extension value missing', async () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {},
          },
          post: {
            responses: {},
          } as any,
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
    const results = await TestHelpers.runRulesWithInputs(
      [
        (await BreakingChangesRuleset.fromOpticConfig({
          exclude_operations_with_extension: [
            { 'x-stability-level': ['draft'] },
          ],
        })) as any,
      ],
      beforeJson,
      afterJson
    );
    expect(results.length).toEqual(1);
  });
});
