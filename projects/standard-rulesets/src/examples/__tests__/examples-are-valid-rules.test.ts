import { test, expect, describe } from '@jest/globals';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { TestHelpers } from '@useoptic/rulesets-base';
import { ExamplesRuleset } from '../index';
import { defaultAjv, validateSchema } from '../requireValidExamples';

const ajvInstance = defaultAjv();

describe('examples ruleset', () => {
  test('passing property example', async () => {
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
                    schema: {
                      type: 'object',
                      properties: {
                        correctObj: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                          },
                          required: ['name'],
                          example: {
                            name: 'hello',
                          },
                        },
                        correctStr: {
                          type: 'string',
                          example: 'abcdefg',
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
      [new ExamplesRuleset({})],
      input,
      input
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.every((result) => result.passed)).toBe(true);
  });

  test('invalid property example errors', async () => {
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
                    schema: {
                      type: 'object',
                      properties: {
                        wrong: {
                          type: 'string',
                          example: 12345,
                        },
                        notSet: {
                          type: 'string',
                        },
                        setAndCorrect: {
                          type: 'string',
                          example: 'abcdefg',
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
      [new ExamplesRuleset({})],
      input,
      input
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });
  test('invalid parameter example errors', async () => {
    const input: OpenAPIV3.Document = {
      ...TestHelpers.createEmptySpec(),
      paths: {
        '/api/users': {
          get: {
            parameters: [
              {
                in: 'query',
                name: 'invalidExample',
                schema: { type: 'string' },
                example: 123,
              },
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
            ],
            responses: {},
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [new ExamplesRuleset({})],
      input,
      input
    );
    expect(results.length > 0).toBe(true);

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

  test('invalid response top level example errors', async () => {
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
                    example: exampleInvalid,
                  },
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [new ExamplesRuleset({})],
      input,
      input
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });
  test('invalid response named example errors', async () => {
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
                      main: {
                        value: exampleInvalid,
                      },
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
      [new ExamplesRuleset({})],
      input,
      input
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });

  test('invalid request top level example errors', async () => {
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
                  example: exampleInvalid,
                },
              },
            },
          },
        },
      },
    };
    const results = await TestHelpers.runRulesWithInputs(
      [new ExamplesRuleset({})],
      input,
      input
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });
  test('invalid request named example errors', async () => {
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
                    main: {
                      value: exampleInvalid,
                    },
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
      [new ExamplesRuleset({})],
      input,
      input
    );
    expect(results.length > 0).toBe(true);

    expect(results).toMatchSnapshot();
    expect(results.some((result) => !result.passed)).toBe(true);
  });
});

describe('examples should default to additional properties false', () => {
  test('ajv config will be strict on additional properties', () => {
    const result = validateSchema(
      {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
      },
      { a: 'abc', b: 'def', c: 'xyz' },
      ajvInstance
    );
    expect(result.pass).toBe(false);
    expect(result).toMatchSnapshot();
  });

  test('ajv config will work on additional properties with all of', () => {
    const result = validateSchema(
      {
        allOf: [
          {
            type: 'object',
            properties: {
              a: { type: 'string' },
            },
          },
          {
            type: 'object',
            properties: {
              b: { type: 'string' },
            },
          },
        ],
      },
      { a: 'abc', b: 'def', c: 'A' },
      ajvInstance
    );
    expect(result.pass).toBe(false);
    expect(result).toMatchSnapshot();
  });

  test('ajv config will work on additional properties with all of at different levels of nesting', () => {
    const result = validateSchema(
      {
        allOf: [
          {
            type: 'object',
            properties: {
              a: { type: 'string' },
            },
          },
          {
            type: 'object',
            properties: {
              b: { type: 'object' },
            },
          },
        ],
      },
      { a: 'abc', b: { l: '' } },
      ajvInstance
    );
    expect(result.pass).toBe(false);
    expect(result).toMatchSnapshot();
  });

  test('ajv config will not override a user defined value', () => {
    const result = validateSchema(
      {
        type: 'object',
        additionalProperties: true,
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
      },
      { a: 'abc', b: 'def', c: 'xyz' },
      ajvInstance
    );
    expect(result.pass).toBe(true);
    expect(result).toMatchSnapshot();
  });

  test('schemas that have existing refs', () => {
    const result = validateSchema(
      {
        type: 'object',
        properties: {
          a: { $ref: './not-important.yml' },
          b: { additionalProperties: { $ref: './not-important.yml' } },
          c: { type: 'string' },
          d: { allOf: [{ $ref: './not-important.yml' }] },
          e: { oneOf: [{ $ref: './not-important.yml' }] },
          f: { anyOf: [{ $ref: './not-important.yml' }] },
          g: { not: { $ref: './not-important.yml' } },
        },
      },
      { a: 'abc', b: 'def', c: 'xyz', d: '', e: '', f: '' },
      ajvInstance
    );
    expect(result.pass).toBe(true);

    const result2 = validateSchema(
      {
        type: 'object',
        properties: {
          a: { $ref: './not-important.yml' },
          b: { additionalProperties: { $ref: './not-important.yml' } },
          c: { type: 'string' },
          d: { allOf: [{ $ref: './not-important.yml' }] },
          e: { oneOf: [{ $ref: './not-important.yml' }] },
          f: { anyOf: [{ $ref: './not-important.yml' }] },
          g: { not: { $ref: './not-important.yml' } },
        },
      },
      { c: 'xyz', d: '', e: '', f: '' },
      ajvInstance
    );
    expect(result2.pass).toBe(true);
  });
});
