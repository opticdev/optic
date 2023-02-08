import { test, expect, describe } from '@jest/globals';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { BreakingChangesRuleset } from '../index';

describe('fromOpticConfig', () => {
  test('invalid configuration', async () => {
    const out = await BreakingChangesRuleset.fromOpticConfig({
      exclude_operations_with_extension: 12,
    });
    expect(out).toEqual(
      '- ruleset/breaking-changes/exclude_operations_with_extension must be string'
    );
  });

  test('valid config', async () => {
    const out = await BreakingChangesRuleset.fromOpticConfig({
      exclude_operations_with_extension: 'x-legacy',
      docs_link: 'asdasd.com',
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
      [new BreakingChangesRuleset()],
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
});

describe('breaking change ruleset configuration', () => {
  test('breaking changes applies a matches function', async () => {
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
        BreakingChangesRuleset.fromOpticConfig({
          exclude_operations_with_extension: 'x-legacy',
        }) as any,
      ],
      beforeJson,
      afterJson
    );
    expect(results.length === 0).toBe(true);
  });
});
