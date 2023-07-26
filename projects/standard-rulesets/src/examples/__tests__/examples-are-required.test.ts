import { test, expect, describe } from '@jest/globals';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { ExamplesRuleset } from '../index';

const requireAll = new ExamplesRuleset({
  require_parameter_examples: true,
  require_request_examples: true,
  require_response_examples: true,
});

describe('examples are required ruleset', () => {
  test('parameters need examples', async () => {
    const input: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            parameters: [
              {
                in: 'query',
                name: 'validExample',
                schema: { type: 'string' },
                example: '123',
              },
              {
                in: 'query',
                name: 'notSet',
                schema: { type: 'string' },
              },
              {
                in: 'query',
                name: 'otherOne',
                schema: { type: 'string' },
                examples: {
                  XYZ: {
                    value: '123',
                  },
                },
              },
            ],
            responses: {},
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [requireAll],
      input,
      input
    );
    expect(results.filter((i) => !i.passed).length).toBe(1);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  const exampleSchema: OpenAPIV3.SchemaObject = {
    type: 'object',
    required: ['hello', 'world'],
    properties: {
      hello: { type: 'string' },
      world: { type: 'number' },
    },
  };

  const exampleInvalid = {
    hello: 123,
  };

  const exampleValid = {
    hello: '123',
    world: 123,
  };

  test('responses with example top level pass', async () => {
    const input: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: exampleSchema,
                    example: exampleValid,
                  },
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [requireAll],
      input,
      input
    );
    expect(results.filter((i) => !i.passed).length === 0).toBe(true);
  });
  test('responses without examples error', async () => {
    const input: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: exampleSchema,
                  },
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [requireAll],
      input,
      input
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });
  test('response with examples named pass', async () => {
    const input: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            responses: {
              '200': {
                description: 'ok',
                content: {
                  'application/json': {
                    schema: exampleSchema,
                    examples: {
                      other: {
                        value: exampleValid,
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
      [requireAll],
      input,
      input
    );
    expect(results.filter((i) => !i.passed).length === 0).toBe(true);
  });

  test('request without example errors', async () => {
    const input: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          post: {
            responses: {},
            requestBody: {
              description: '',
              content: {
                'application/json': {
                  schema: exampleSchema,
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [requireAll],
      input,
      input
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('request with top level example passes', async () => {
    const input: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          post: {
            responses: {},
            requestBody: {
              description: '',
              content: {
                'application/json': {
                  schema: exampleSchema,
                  example: exampleValid,
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [requireAll],
      input,
      input
    );
    expect(results.filter((i) => !i.passed).length === 0).toBe(true);
  });

  test('request with named examples passes', async () => {
    const input: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          post: {
            responses: {},
            requestBody: {
              description: 'ok',
              content: {
                'application/json': {
                  schema: exampleSchema,
                  examples: {
                    other: {
                      value: exampleValid,
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
      [requireAll],
      input,
      input
    );
    expect(results.filter((i) => !i.passed).length === 0).toBe(true);
  });
});
