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
      const interaction: CapturedInteraction = {
        request: {
          host: 'localhost:3030',
          method: OpenAPIV3.HttpMethods.POST,
          path: '/api/animals',
          body: CapturedBody.fromJSON({
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
          }),
          headers: [],
          query: [],
        },
        response: {
          statusCode: '200',
          body: CapturedBody.fromJSON({}),
          headers: [],
        },
      };

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
      const interaction: CapturedInteraction = {
        request: {
          host: 'localhost:3030',
          method: OpenAPIV3.HttpMethods.POST,
          path: '/api/animals',
          body: null,
          headers: [],
          query: [],
        },
        response: {
          statusCode: '200',
          body: CapturedBody.fromJSON({
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
          }),
          headers: [],
        },
      };

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

      const interaction: CapturedInteraction = {
        request: {
          host: 'localhost:3030',
          method: OpenAPIV3.HttpMethods.POST,
          path: '/api/animals',
          body: null,
          headers: [],
          query: [],
        },
        response: {
          statusCode: '200',
          body: CapturedBody.fromJSON({
            name: 'me',
          }),
          headers: [],
        },
      };

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

      const interaction: CapturedInteraction = {
        request: {
          host: 'localhost:3030',
          method: OpenAPIV3.HttpMethods.POST,
          path: '/api/animals',
          body: null,
          headers: [],
          query: [],
        },
        response: {
          statusCode: '200',
          body: CapturedBody.fromJSON({
            name: 'me',
          }),
          headers: [],
        },
      };

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

      const interaction: CapturedInteraction = {
        request: {
          host: 'localhost:3030',
          method: OpenAPIV3.HttpMethods.POST,
          path: '/api/animals',
          body: null,
          headers: [],
          query: [],
        },
        response: {
          statusCode: '200',
          body: CapturedBody.fromJSON({}),
          headers: [],
        },
      };

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

    const patches = await AT.collect(
      generateRefRefactorPatches(specHolder, addedSchemaPaths)
    );

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

    const patches = await AT.collect(
      generateRefRefactorPatches(specHolder, addedSchemaPaths)
    );

    expect(patches).toMatchSnapshot();
    expect(specHolder.spec).toMatchSnapshot();
  });
});
