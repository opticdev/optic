import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { BreakingChangesRuleset } from '../index';

describe('range changes', () => {
  test('numeric range expanded', () => {
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
                      price: {
                        type: 'number',
                        maximum: 100,
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
                      price: {
                        type: 'number',
                        maximum: 130, // change
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
    const results = TestHelpers.runRulesWithInputs(
      [new BreakingChangesRuleset()],
      beforeJson,
      afterJson
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });
  test('array length increased', () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {},
                    maxItems: 10,
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
                    type: 'array',
                    items: {},
                    maxItems: 16,
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
  test('array length decreased', () => {
    const beforeJson: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {},
                    minItems: 10,
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
                    type: 'array',
                    items: {},
                    minItems: 3,
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
});
