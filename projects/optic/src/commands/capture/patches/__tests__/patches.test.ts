import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  generatePathAndMethodSpecPatches,
  generateEndpointSpecPatches,
  generateRefRefactorPatches,
} from '../patches';
import * as AT from '../../../oas/lib/async-tools';

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
        info: {
          openapi: version,
        },
        paths: {
          '/api/animals': {
            post: {
              responses: {},
            },
          },
        },
      };
    });

    test('undocumented request body', () => {});

    test('undocumented response body', () => {});

    test('undocumented property in schema', () => {});

    test('mismatched type in schema', () => {});

    test('mismatched oneOf schema', () => {});

    test('missing required property', () => {});

    test('', () => {});
  });
});

describe('generateRefRefactorPatches', () => {
  test('adds new component schema for endpoint', () => {});

  test('uses existing component schema if close enough', () => {});
});
