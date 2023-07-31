import { test, expect, describe } from '@jest/globals';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { BreakingChangesRuleset } from '../index';

describe('breaking changes ruleset - parameter enum change', () => {
  test.each(['query', 'cookie', 'path', 'header'])(
    'enum added to %p parameter',
    async (location: string) => {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'test',
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
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                    enum: ['a', 'b'], // a new enum is added
                  },
                },
              ],
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
    }
  );

  test.each(['query', 'cookie', 'path', 'header'])(
    '%p parameter enum narrowing',
    async (location: string) => {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                    enum: ['a', 'b'],
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
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                    enum: ['b'], // enum values are restricted
                  },
                },
              ],
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
    }
  );
  test.each(['query', 'cookie', 'path', 'header'])(
    'enum converted to const %p parameter',
    async (location: string) => {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                    const: 'a',
                    // Casting because const does not exist in OpenAPIV3.NonArraySchemaObject
                  } as OpenAPIV3.NonArraySchemaObject,
                },
              ],
              responses: {},
            },
          },
        },
      } as OpenAPIV3.Document;
      const afterJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                    enum: ['a'], // enum converted to const
                  },
                },
              ],
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
      expect(results.some((result) => !result.passed)).toBe(false);
    }
  );
  test.each(['query', 'cookie', 'path', 'header'])(
    'const changes picked up as breaking %p parameter',
    async (location: string) => {
      const beforeJson: OpenAPIV3.Document = {
        ...TestHelpers.createEmptySpec(),
        paths: {
          '/api/users': {
            get: {
              parameters: [
                {
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                    const: 'a',
                    // Casting because const does not exist in OpenAPIV3.NonArraySchemaObject
                  } as OpenAPIV3.NonArraySchemaObject,
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
                  name: 'test',
                  in: location,
                  schema: {
                    type: 'string',
                    const: 'b', // const changed
                    // Casting because const does not exist in OpenAPIV3.NonArraySchemaObject
                  } as OpenAPIV3.NonArraySchemaObject,
                },
              ],
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
    }
  );
  test('enums in bodies', async () => {
    const beforeJson: OpenAPIV3.Document = {
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
                        enum: {
                          type: 'string',
                          enum: ['A', 'B', 'C'],
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
                description: '',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        enum: {
                          type: 'string',
                          enum: ['A', 'B'],
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
});
