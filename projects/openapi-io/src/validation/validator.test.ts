import fs from 'fs-extra';

import OpenAPISchemaValidator, { validateOpenApiV3Document } from './validator';
import { parseOpenAPIWithSourcemap } from '@useoptic/openapi-io';
import path from 'path';
import { defaultEmptySpec } from '@useoptic/openapi-utilities';

test('valid open api document should not raise errors', async () => {
  validateOpenApiV3Document(defaultEmptySpec);
  validateOpenApiV3Document(
    (await fs.readJson('./inputs/openapi3/petstore0.json.flattened.json'))
      .jsonLike
  );
});

test('valid open 3.1 api document should not raise errors', async () => {
  validateOpenApiV3Document(defaultEmptySpec);
  validateOpenApiV3Document(
    await fs.readJson('./inputs/openapi3/todo-api-3_1.json')
  );
});

test('open api doc with no path should throw an error', () => {
  expect(() => {
    validateOpenApiV3Document({
      openapi: '3.1.3',
      info: { version: '0.0.0', title: 'Empty' },
    });
  }).toThrowError();
});

test('open api doc with extra custom parameters', () => {
  validateOpenApiV3Document({
    ...defaultEmptySpec,
    'x-extra_property': {
      abc: 'asd',
    },
  });

  validateOpenApiV3Document({
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
    validateOpenApiV3Document(json);
  }).toThrowErrorMatchingSnapshot();
});

test('processValidatorErrors with sourcemap', async () => {
  const spec = await parseOpenAPIWithSourcemap(
    path.join(__dirname, '../../inputs/openapi3/broken-open-api.json')
  );
  expect(() => {
    validateOpenApiV3Document(
      spec.jsonLike,
      new OpenAPISchemaValidator(),
      spec.sourcemap
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
    validateOpenApiV3Document(json);
  }).toThrowErrorMatchingSnapshot();
});
