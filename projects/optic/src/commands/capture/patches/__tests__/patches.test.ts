import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  generatePathAndMethodSpecPatches,
  generateEndpointSpecPatches,
  generateRefRefactorPatches,
} from '../patches';
import * as AT from '../../../oas/lib/async-tools';
import {
  CapturedInteraction,
  CapturedInteractions,
} from '../../sources/captured-interactions';
import { CapturedBody } from '../../sources/body';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

async function* GenerateInteractions(
  interactions: CapturedInteraction[]
): CapturedInteractions {
  for (const i of interactions) {
    yield i;
  }
}

function makeInteraction(
  endpoint: { method: OpenAPIV3.HttpMethods; path: string },
  {
    parameters,
    requestBody,
    responseBody,
  }: {
    parameters?: {
      header?: { name: string; value: string }[];
      query?: { name: string; value: string }[];
      responseHeaders?: { name: string; value: string }[];
    };
    requestBody?: any;
    responseBody?: any;
  }
): CapturedInteraction {
  return {
    request: {
      host: 'localhost:3030',
      method: endpoint.method,
      path: endpoint.path,
      body: requestBody ? CapturedBody.fromJSON(requestBody) : null,
      headers: parameters?.header ?? [],
      query: parameters?.query ?? [],
    },
    response: {
      statusCode: '200',
      body: CapturedBody.fromJSON(responseBody ?? {}),
      headers: parameters?.responseHeaders ?? [],
    },
  };
}

describe('generatePathAndMethodSpecPatches', () => {
  const specHolder: any = {};
  beforeEach(() => {
    specHolder.spec = {
      info: {},
      paths: {
        '/api/animals': {
          get: {
            responses: {},
          },
        },
      },
    };
  });

  test('generates path and method if endpoint does not exist', async () => {
    const patches = await AT.collect(
      generatePathAndMethodSpecPatches(specHolder, {
        method: 'get',
        path: '/api/users',
      })
    );

    expect(patches).toMatchSnapshot();
    expect(specHolder.spec).toMatchSnapshot();
  });

  test('generates a method if the path exists but method does not', async () => {
    const patches = await AT.collect(
      generatePathAndMethodSpecPatches(specHolder, {
        method: 'post',
        path: '/api/animals',
      })
    );

    expect(patches).toMatchSnapshot();
    expect(specHolder.spec).toMatchSnapshot();
  });
});

describe('generateEndpointSpecPatches', () => {
  const specHolder: any = {};

  describe.each([['3.0.1'], ['3.1.0']])('OAS version %s', (version) => {
    beforeEach(() => {
      specHolder.spec = {
        openapi: version,
        info: {},
        paths: {
          '/api/animals': {
            post: {
              responses: {},
            },
          },
        },
      };
    });

    test('undocumented request body', async () => {
      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          requestBody: {
            name: 'me',
            age: 100,
            created_at: '2023-07-20T14:39:22.184Z',
            hobbies: [
              'running',
              {
                type: 'sport',
                name: 'fishing',
              },
              {
                type: 'sport',
                name: 'basketball',
                skill: 100,
                bad: null,
              },
            ],
            active: true,
          },
        }
      );

      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('undocumented response body', async () => {
      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {
            name: 'me',
            age: 100,
            created_at: '2023-07-20T14:39:22.184Z',
            hobbies: [
              'running',
              {
                type: 'sport',
                name: 'fishing',
              },
              {
                type: 'sport',
                name: 'basketball',
                skill: 100,
                bad: null,
              },
            ],
            active: true,
          },
        }
      );

      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('undocumented property in schema', async () => {
      specHolder.spec.paths['/api/animals'].post.responses = {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {},
              },
            },
          },
        },
      };

      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {
            name: 'me',
          },
        }
      );

      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('mismatched type in schema', async () => {
      specHolder.spec.paths['/api/animals'].post.responses = {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
      };
      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {
            name: 'me',
          },
        }
      );

      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('missing required property', async () => {
      specHolder.spec.paths['/api/animals'].post.responses = {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                },
                required: ['name'],
              },
            },
          },
        },
      };
      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {},
        }
      );
      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('existing schema that does not match', async () => {
      specHolder.spec.paths['/api/animals'].post.responses = {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { type: 'array', items: { type: 'object' } },
                  next: { nullable: true },
                  has_more_data: { type: 'boolean' },
                },
                required: ['data', 'next', 'has_more_data'],
              },
            },
          },
        },
      };
      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {
            books: [
              {
                id: 'WjE9O1d8ELCb8POiOw4pn',
                name: 'Pride and Prejudice',
                author_id: '6nTxAFM5ck4Hob77hGQoL',
                price: 10,
                created_at: '2023-01-22T17:17:41.326Z',
                updated_at: '2023-01-22T17:17:41.326Z',
              },
              {
                id: 'vZsYVmzdxtihxQNqCs-3f',
                name: 'The Great Gatsby',
                author_id: 'NjpTwgmENj11rGdUgpCQ9',
                price: 15,
                created_at: '2022-10-22T10:11:51.421Z',
                updated_at: '2022-10-22T10:11:51.421Z',
              },
            ],
          },
        }
      );

      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('array with multiple items', async () => {
      specHolder.spec.paths['/api/animals'].post.responses = {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
              },
            },
          },
        },
      };
      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {
            books: [
              {
                id: 'WjE9O1d8ELCb8POiOw4pn',
                author_id: '6nTxAFM5ck4Hob77hGQoL',
                price: 10,
              },
              {
                id: 'asdf',
                price: 1,
              },
              {
                id: '123',
                author_id: '6nTxAFM5ck4Hob77hGQoL',
              },
              null,
            ],
          },
        }
      );
      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('interactions with non-alphanumeric keys', async () => {
      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {
            data: [
              {
                "tuple(('duration', 300))": [['duration', 300]],
                'tpm()': 0.0,
                'failure_rate()': 0,
                'user_misery()': 0.0,
                '😃things': ['duration', 300],
              },
            ],
            meta: {
              fields: {
                "tuple(('duration', 300))": 'string',
                'blah()': 'number',
                project_threshold_config: 'string',
              },
              units: {
                "tuple(('duration', 300))": null,
                'blah()': null,
                '😃things': null,
              },
              isMetricsData: false,
              tips: { query: null, columns: null },
              dataset: 'discover',
            },
          },
        }
      );

      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('schema with enum', async () => {
      specHolder.spec.paths['/api/animals'].post.responses = {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['ready', 'not_ready'] },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                          enum: ['ready', 'not_ready'],
                        },
                      },
                    },
                  },
                },
                required: ['status'],
              },
            },
          },
        },
      };

      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {
            status: 'something-else',
            data: [{ status: 'something-else' }, { status: 'another-thing' }],
          },
        }
      );

      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('schema with arrays with polymorphic items', async () => {
      specHolder.spec.paths['/api/animals'].post.responses = {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                        },
                      },
                      required: ['status'],
                    },
                  },
                },
              },
            },
          },
        },
      };

      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {
            data: [
              { status: null },
              { status: 'something-else' },
              { status: 'another-thing' },
              { status: null },
              { status: 123 },
            ],
          },
        }
      );

      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('collects unpatchable diffs', async () => {
      specHolder.spec.paths['/api/animals'].post.responses = {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                          const: 'ok',
                        },
                      },
                      required: ['status'],
                    },
                  },
                },
              },
            },
          },
        },
      };

      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {
            data: [{ status: 'ok' }, { status: 'not-ok' }],
          },
        }
      );

      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('3.0.x exclusiveMaximum and exclusiveMinimum booleans', async () => {
      if (version !== '3.0.1') return;
      specHolder.spec.paths['/api/animals'].post.responses = {
        '200': {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        no: {
                          type: 'number',
                          maximum: 20,
                          exclusiveMaximum: true,
                          minumum: 10,
                          exclusiveMinumum: true,
                        },
                      },
                      required: ['no'],
                    },
                  },
                },
              },
            },
          },
        },
      };

      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          responseBody: {
            data: [{ no: 10 }, { no: 20 }],
          },
        }
      );

      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    describe('allOf', () => {
      test('matching interaction', async () => {
        specHolder.spec.paths['/api/animals'].post.responses = {
          '200': {
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                        },
                        age: {
                          type: 'number',
                        },
                      },
                      required: ['status'],
                    },
                    {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        };

        const interaction = makeInteraction(
          { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
          {
            responseBody: { status: 'ok', name: 'me', age: 50 },
          }
        );

        const patches = await AT.collect(
          generateEndpointSpecPatches(
            GenerateInteractions([interaction]),
            specHolder,
            {
              method: 'post',
              path: '/api/animals',
            }
          )
        );

        expect(patches).toMatchSnapshot();
        expect(specHolder.spec).toMatchSnapshot();
      });

      test('with extra keys in interaction', async () => {
        specHolder.spec.paths['/api/animals'].post.responses = {
          '200': {
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                        },
                      },
                      required: ['status'],
                    },
                    {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        asda: {
                          type: 'object',
                          properties: {},
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        };

        const interaction = makeInteraction(
          { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
          {
            responseBody: {
              status: 'ok',
              name: 'me',
              age: 50,
              asda: { as: 12 },
            },
          }
        );

        const patches = await AT.collect(
          generateEndpointSpecPatches(
            GenerateInteractions([interaction]),
            specHolder,
            {
              method: 'post',
              path: '/api/animals',
            }
          )
        );

        expect(patches).toMatchSnapshot();
        expect(specHolder.spec).toMatchSnapshot();
      });

      test('allOf in a property', async () => {
        specHolder.spec.paths['/api/animals'].post.responses = {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      allOf: [
                        {
                          type: 'object',
                          properties: {
                            status: {
                              type: 'string',
                            },
                          },
                          required: ['status'],
                        },
                        {
                          type: 'object',
                          properties: {
                            name: {
                              type: 'string',
                            },
                            asda: {
                              type: 'object',
                              properties: {},
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
        };

        const interaction = makeInteraction(
          { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
          {
            responseBody: {
              data: { status: 'ok', name: 'me', age: 50, asda: { as: 12 } },
            },
          }
        );

        const patches = await AT.collect(
          generateEndpointSpecPatches(
            GenerateInteractions([interaction]),
            specHolder,
            {
              method: 'post',
              path: '/api/animals',
            }
          )
        );

        expect(patches).toMatchSnapshot();
        expect(specHolder.spec).toMatchSnapshot();
      });

      test('with missing keys in interaction', async () => {
        specHolder.spec.paths['/api/animals'].post.responses = {
          '200': {
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                        },
                      },
                      required: ['status'],
                    },
                    {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                      },
                      required: ['name'],
                    },
                  ],
                },
              },
            },
          },
        };

        const interaction = makeInteraction(
          { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
          {
            responseBody: { status: 'ok' },
          }
        );

        const patches = await AT.collect(
          generateEndpointSpecPatches(
            GenerateInteractions([interaction]),
            specHolder,
            {
              method: 'post',
              path: '/api/animals',
            }
          )
        );

        expect(patches).toMatchSnapshot();
        expect(specHolder.spec).toMatchSnapshot();
      });

      test('with nested oneOf', async () => {
        specHolder.spec.paths['/api/animals'].post.responses = {
          '200': {
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    {
                      oneOf: [
                        {
                          type: 'object',
                          properties: {
                            hello: {
                              type: 'string',
                            },
                            goodbye: {
                              type: 'string',
                            },
                          },
                          required: ['hello', 'goodbye'],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          },
        };

        const interaction = makeInteraction(
          { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
          {
            responseBody: {
              hello: 'ok',
              goodbye: 'me',
              results: ['123', '355', 34],
            },
          }
        );

        const patches = await AT.collect(
          generateEndpointSpecPatches(
            GenerateInteractions([interaction]),
            specHolder,
            {
              method: 'post',
              path: '/api/animals',
            }
          )
        );

        expect(patches).toMatchSnapshot();
        expect(specHolder.spec).toMatchSnapshot();
      });

      test('with nullable', async () => {
        // nullable keyword only valid in 3.0.1
        if (version !== '3.0.1') return;
        specHolder.spec.paths['/api/animals'].post.responses = {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['key'],
                  properties: {
                    key: {
                      nullable: true,
                      allOf: [
                        {
                          type: 'object',
                          properties: {
                            hello: {
                              type: 'string',
                            },
                            goodbye: {
                              type: 'string',
                            },
                          },
                          required: ['hello', 'goodbye'],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        };

        const interaction = makeInteraction(
          { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
          {
            responseBody: {
              key: null,
            },
          }
        );

        const patches = await AT.collect(
          generateEndpointSpecPatches(
            GenerateInteractions([interaction]),
            specHolder,
            {
              method: 'post',
              path: '/api/animals',
            }
          )
        );

        expect(patches).toMatchSnapshot();
        expect(specHolder.spec).toMatchSnapshot();
      });
    });

    describe.each([['query'], ['header']])('%s parameter', (location) => {
      test('not documented', async () => {
        const interaction = makeInteraction(
          { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
          {
            parameters: {
              [location]: [{ name: 'undocumented', value: 'abc' }],
            },
          }
        );
        const patches = await AT.collect(
          generateEndpointSpecPatches(
            GenerateInteractions([interaction]),
            specHolder,
            {
              method: 'post',
              path: '/api/animals',
            }
          )
        );

        expect(patches).toMatchSnapshot();
        expect(specHolder.spec).toMatchSnapshot();
      });

      test('required but not seen', async () => {
        specHolder.spec.paths['/api/animals'].post.parameters = [
          {
            in: location,
            name: 'required',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ];
        const interaction = makeInteraction(
          { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
          {}
        );
        const patches = await AT.collect(
          generateEndpointSpecPatches(
            GenerateInteractions([interaction]),
            specHolder,
            {
              method: 'post',
              path: '/api/animals',
            }
          )
        );

        expect(patches).toMatchSnapshot();
        expect(specHolder.spec).toMatchSnapshot();
      });
    });

    test('response headers not documented', async () => {
      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {
          parameters: {
            responseHeaders: [{ name: 'undocumented', value: 'abc' }],
          },
        }
      );
      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });

    test('response headers required but not seen', async () => {
      specHolder.spec.paths['/api/animals'].post.responses = {
        '200': {
          headers: {
            required: {
              name: 'required',
              required: true,
              schema: {
                type: 'string',
              },
            },
          },
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        status: {
                          type: 'string',
                          const: 'ok',
                        },
                      },
                      required: ['status'],
                    },
                  },
                },
              },
            },
          },
        },
      };
      const interaction = makeInteraction(
        { method: OpenAPIV3.HttpMethods.POST, path: '/api/animals' },
        {}
      );
      const patches = await AT.collect(
        generateEndpointSpecPatches(
          GenerateInteractions([interaction]),
          specHolder,
          {
            method: 'post',
            path: '/api/animals',
          }
        )
      );

      expect(patches).toMatchSnapshot();
      expect(specHolder.spec).toMatchSnapshot();
    });
  });
});

describe('generateRefRefactorPatches', () => {
  const specHolder: any = {};
  let addedSchemaPaths: Set<string>;

  beforeEach(() => {
    addedSchemaPaths = new Set([
      jsonPointerHelpers.compile([
        'paths',
        '/api/animals',
        'post',
        'responses',
        '200',
        'content',
        'application/json',
        'schema',
      ]),
    ]);
    specHolder.spec = {
      openapi: '3.0.1',
      info: {},
      paths: {
        '/api/animals': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        format: 'int64',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        id: { type: 'string' },
                        age: { type: 'number' },
                        created_at: { type: 'string' },
                      },
                      required: ['name', 'id'],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  });
  test('adds new component schema if no close schema', async () => {
    // Should be different enough
    specHolder.spec.components = {
      schemas: {
        MySchema: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  age: { type: 'number' },
                },
              },
            },
          },
        },
      },
    };
    const meta = {
      schemaAdditionsSet: addedSchemaPaths,
      usedExistingRef: false,
    };
    const patches = await AT.collect(
      generateRefRefactorPatches(specHolder, meta)
    );

    expect(meta.usedExistingRef).toBe(false);
    expect(patches).toMatchSnapshot();
    expect(specHolder.spec).toMatchSnapshot();
  });

  test('uses existing component schema if close enough', async () => {
    // Should be close enough
    specHolder.spec.components = {
      schemas: {
        MySchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            id: { type: 'string' },
            age: { type: 'number' },
            created_at: { type: 'string' },
          },
          required: ['name', 'id'],
        },
      },
    };
    const meta = {
      schemaAdditionsSet: addedSchemaPaths,
      usedExistingRef: false,
    };
    const patches = await AT.collect(
      generateRefRefactorPatches(specHolder, meta)
    );

    expect(meta.usedExistingRef).toBe(true);
    expect(patches).toMatchSnapshot();
    expect(specHolder.spec).toMatchSnapshot();
  });

  test('only tried to add component schema once', async () => {
    addedSchemaPaths.add(
      jsonPointerHelpers.compile([
        'paths',
        '/api/animals',
        'post',
        'requestBody',
        'content',
        'application/json',
        'schema',
      ])
    );
    const meta = {
      schemaAdditionsSet: addedSchemaPaths,
      usedExistingRef: false,
    };
    const patches = await AT.collect(
      generateRefRefactorPatches(specHolder, meta)
    );

    expect(meta.usedExistingRef).toBe(false);
    expect(patches).toMatchSnapshot();
    expect(specHolder.spec).toMatchSnapshot();
  });
});
