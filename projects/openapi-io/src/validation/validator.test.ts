import { test, expect, describe } from '@jest/globals';
import fs from 'node:fs/promises';

import { validateOpenApiV3Document } from './validator';
import { parseOpenAPIWithSourcemap } from '../parser/openapi-sourcemap-parser';
import path from 'path';
import { defaultEmptySpec } from '@useoptic/openapi-utilities';

async function readJson(p: string) {
  const contents = await fs.readFile(p, 'utf-8');
  return JSON.parse(contents);
}

describe('strict validation', () => {
  test('valid open api document should not raise errors', async () => {
    validateOpenApiV3Document(defaultEmptySpec);
    validateOpenApiV3Document(
      (await readJson('./inputs/openapi3/petstore0.json.flattened.json'))
        .jsonLike
    );
  });

  test('valid open 3.1 api document should not raise errors', async () => {
    validateOpenApiV3Document(defaultEmptySpec);
    validateOpenApiV3Document(
      await readJson('./inputs/openapi3/todo-api-3_1.json')
    );
  });

  test('open api doc with no description in response should throw', () => {
    expect(() => {
      validateOpenApiV3Document(
        {
          openapi: '3.1.3',
          info: { version: '0.0.0', title: 'Empty' },
          paths: {
            '/example': {
              get: {
                responses: {
                  '200': {},
                },
              },
            },
          },
        },
        undefined,
        { strictOpenAPI: true }
      );
    }).toThrowErrorMatchingSnapshot();
  });

  test('advanced validators run and append their results', () => {
    const json: any = {
      ...defaultEmptySpec,
      paths: {
        '/api/users/{userId}': {
          get: {
            responses: {
              '200': {
                description: 'hello',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      oneOf: [],
                      anyOf: [],
                      items: [],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    expect(() => {
      validateOpenApiV3Document(json, undefined, { strictOpenAPI: true });
    }).toThrowErrorMatchingSnapshot();
  });

  test('open api doc with extra custom parameters', () => {
    validateOpenApiV3Document({
      ...defaultEmptySpec,
      'x-extra_property': {
        abc: 'asd',
      },
    });

    validateOpenApiV3Document(
      {
        ...defaultEmptySpec,
        paths: {
          '/user/login': {
            get: {
              tags: ['user'],
              'x-maturity': 'wip',
              summary: 'Logs user into the system',
              operationId: 'loginUser',
              parameters: [
                {
                  name: 'username',
                  in: 'query',
                  description: 'The user name for login',
                  required: true,
                  schema: {
                    type: 'string',
                  },
                },
                {
                  name: 'password',
                  in: 'query',
                  description: 'The password for login in clear text',
                  required: true,
                  schema: {
                    type: 'string',
                  },
                },
              ],
              responses: {
                '200': {
                  description: 'successful operation',
                  headers: {
                    'X-Rate-Limit': {
                      description: 'calls per hour allowed by the user',
                      schema: {
                        type: 'integer',
                        format: 'int32',
                      },
                    },
                    'X-Expires-After': {
                      description: 'date in UTC when token expires',
                      schema: {
                        type: 'string',
                        format: 'date-time',
                      },
                    },
                  },
                  content: {
                    'application/xml': {
                      schema: {
                        type: 'string',
                      },
                    },
                    'application/json': {
                      schema: {
                        type: 'string',
                      },
                    },
                  },
                },
                '400': {
                  description: 'Invalid username/password supplied',
                  content: {},
                },
              },
            },
          },
        },
      },
      undefined,
      { strictOpenAPI: true }
    );
  });

  test('openapi with webhooks', async () => {
    validateOpenApiV3Document(
      await readJson('./inputs/openapi3/openapi-webhook.json')
    );
  });
});

describe('non-strict validation', () => {
  describe('should pass', () => {
    test('open api doc with no description in response', () => {
      validateOpenApiV3Document(
        {
          openapi: '3.1.3',
          info: { version: '0.0.0', title: 'Empty' },
          paths: {
            '/example': {
              get: {
                responses: {
                  '200': {},
                },
              },
            },
          },
        },
        undefined,
        { strictOpenAPI: false }
      );
    });

    test('additional properties in invalid place', () => {
      validateOpenApiV3Document(
        {
          openapi: '3.1.3',
          info: { version: '0.0.0', title: 'Empty', badproperty: ':(' },
          paths: {
            '/example': {
              get: {
                responses: {
                  '200': {},
                },
              },
            },
          },
        },
        undefined,
        { strictOpenAPI: false }
      );
    });
  });

  describe('should fail', () => {
    test('open api doc without responses', () => {
      expect(() => {
        validateOpenApiV3Document(
          {
            openapi: '3.1.3',
            info: { version: '0.0.0', title: 'Empty' },
            paths: {
              '/example': {
                get: {},
              },
            },
          },
          undefined,
          { strictOpenAPI: false }
        );
      }).toThrowErrorMatchingSnapshot();
    });

    test('open api doc with invalid status code shape', () => {
      expect(() => {
        validateOpenApiV3Document(
          {
            openapi: '3.1.3',
            info: { version: '0.0.0', title: 'Empty' },
            paths: {
              '/example': {
                get: {
                  responses: {
                    '202': null,
                  },
                },
              },
            },
          },
          undefined,
          { strictOpenAPI: false }
        );
      }).toThrowErrorMatchingSnapshot();
    });

    test('open api doc with no path should throw an error', () => {
      expect(() => {
        validateOpenApiV3Document(
          {
            openapi: '3.1.3',
            info: { version: '0.0.0', title: 'Empty' },
          },
          undefined,
          { strictOpenAPI: false }
        );
      }).toThrowErrorMatchingSnapshot();
    });
  });
});

test('processValidatorErrors', () => {
  const json: any = {
    ...defaultEmptySpec,
    paths: {
      '/api/users/{userId}': {
        get: {
          responses: {
            '200': {
              description: 'hello',
              headers: { isgood: { schema: {} } },
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      hello: {
                        type: 'array',
                        items: 'no',
                      },
                    },
                  },
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
  expect(() => {
    validateOpenApiV3Document(json, undefined, { strictOpenAPI: true });
  }).toThrowErrorMatchingSnapshot();
});

test('processValidatorErrors attaches the sourcemap', async () => {
  const spec = await parseOpenAPIWithSourcemap(
    path.join(__dirname, '../../inputs/openapi3/broken-open-api.json')
  );

  try {
    validateOpenApiV3Document(spec.jsonLike, spec.sourcemap, {
      strictOpenAPI: true,
    });
  } catch (error) {
    const filterOutFileNames = (error as any).message
      .split('\n')
      .filter((i: any) => !i.startsWith('[90m/'))
      .join('\n');

    expect(filterOutFileNames).toMatchSnapshot();
  }
});
