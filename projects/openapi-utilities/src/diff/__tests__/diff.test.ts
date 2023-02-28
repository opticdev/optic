import { describe, test, expect } from '@jest/globals';
import { diff, ObjectDiff, reconcileDiff } from '../diff';
import { before, after } from './mock-data';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { FlatOpenAPIV3 } from '../../flat-openapi-types';

describe('diff openapi', () => {
  test('can diff an openapi spec', () => {
    expect(diff(before, after)).toMatchSnapshot();
  });

  describe('diff behavior', () => {
    test('adding a key', () => {
      const diffResults = diff({}, { added: true });
      expect(diffResults.length).toBe(1);
      expect(diffResults).toMatchSnapshot();
    });

    test('removing a key', () => {
      const diffResults = diff({ removed: true }, {});
      expect(diffResults.length).toBe(1);
      expect(diffResults).toMatchSnapshot();
    });

    test('removing a key with path reconciliation', () => {
      const diffResults = diff(
        {
          parameters: [
            {
              name: 'changeme',
              in: 'query',
              nested: { schema: { removeme: true, stillhere: 's' } },
            },
            { name: 'unchanged', in: 'query' },
            { name: 'unchanged2', in: 'query' },
          ],
        },
        {
          parameters: [
            { name: 'unchanged', in: 'query' },
            { name: 'unchanged2', in: 'query' },
            {
              name: 'changeme',
              in: 'query',
              nested: { schema: { stillhere: 's' } },
            },
          ],
        },
        jsonPointerHelpers.compile(['paths', '/me', 'get'])
      );
      expect(diffResults.length).toBe(1);
      expect(diffResults).toMatchSnapshot();
    });

    test('changing a key value', () => {
      const diffResults = diff(
        { changed: 'one value' },
        { changed: 'another value' }
      );
      expect(diffResults.length).toBe(1);
      expect(diffResults).toMatchSnapshot();
    });

    test('changing a key type (primitives)', () => {
      const diffResults = diff({ changed: 'one value' }, { changed: 123 });
      expect(diffResults.length).toBe(1);
      expect(diffResults).toMatchSnapshot();
    });

    test('changing a key type (false)', () => {
      const diffResults = diff({ changed: 'one value' }, { changed: false });
      expect(diffResults.length).toBe(1);
      expect(diffResults).toMatchSnapshot();
    });

    test('changing a key type (objects)', () => {
      const diffResults = diff({ changed: {} }, { changed: false });
      expect(diffResults.length).toBe(1);
      expect(diffResults).toMatchSnapshot();
    });
  });

  describe('diff with array values', () => {
    test('diffs for parameters', () => {
      const diffNoChanges = diff(
        [
          { name: 'hello', in: 'query' },
          { name: 'goodbye', in: 'query' },
        ],
        [
          { name: 'goodbye', in: 'query' },
          { name: 'hello', in: 'query' },
        ],
        '/paths/test/get/parameters'
      );
      const diffWithChanges = diff(
        [
          { name: 'hello', in: 'query' },
          { name: 'hello', in: 'header' },
          { name: 'goodbye', in: 'query' },
        ],
        [
          { name: 'goodbye', in: 'query' },
          { name: 'hello', in: 'query' },
        ],
        jsonPointerHelpers.compile(['paths', '/me', 'get', 'parameters'])
      );
      expect(diffNoChanges.length).toBe(0);

      expect(diffWithChanges.length).toBe(1);
      expect(diffWithChanges).toMatchSnapshot();
    });

    test('diffs for primitive values', () => {
      const diffNoChanges = diff(['hello', 'goodbye'], ['goodbye', 'hello']);
      const diffWithChanges = diff(
        ['hello', 'newadded', 'goodbye'],
        ['goodbye', 'hello']
      );
      expect(diffNoChanges.length).toBe(0);

      expect(diffWithChanges.length).toBe(1);
      expect(diffWithChanges).toMatchSnapshot();
    });

    test('diffs for positional values (fallback case)', () => {
      const diffWithChanges = diff(
        ['hello', { value: 'newadded' }, 'goodbye'],
        ['hello', 'goodbye']
      );

      // because we have positional identity, it's expected that a change in array position will result in an extra diff item
      expect(diffWithChanges.length).toBe(2);
      expect(diffWithChanges).toMatchSnapshot();
    });

    test('diffs operations even if variable names change ', () => {
      const diffNoChanges = diff(
        {
          paths: {
            '/user/{userId}': { get: { responses: {} } },
          },
        },
        {
          paths: {
            '/user/{user_id}': { get: { responses: {} } },
          },
        }
      );
      const diffWithChanges = diff(
        {
          paths: {
            '/user/{userId}': { get: { operationId: 'before', responses: {} } },
          },
        },
        {
          paths: {
            '/user/{user_Id}': { get: { operationId: 'after', responses: {} } },
          },
        }
      );
      expect(diffNoChanges.length).toBe(0);

      expect(diffWithChanges.length).toBe(1);
      expect(diffWithChanges).toMatchSnapshot();
    });

    test('diffs operations even if variable names change request body', () => {
      const diffNoChanges = diff(
        {
          paths: {
            '/user/{userId}': {
              get: {
                responses: {},
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: { abc: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          paths: {
            '/user/{user_id}': {
              get: {
                responses: {},
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: { abc: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      );
      const diffWithChanges = diff(
        {
          paths: {
            '/user/{userId}': {
              get: {
                responses: {},
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: { abc: { type: 'string' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          paths: {
            '/user/{user_Id}': {
              get: {
                responses: {},
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {},
                      },
                    },
                  },
                },
              },
            },
          },
        }
      );
      expect(diffNoChanges.length).toBe(0);

      expect(diffWithChanges.length).toBe(1);
      expect(diffWithChanges).toMatchSnapshot();
    });
  });

  test('diff with empty array', () => {
    expect(diff({}, after)).toMatchSnapshot();
  });

  describe('object <> allOf compares properties properly', () => {
    test('no diff on refactor to allOf', () => {
      const objectBefore: FlatOpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'number' },
        },
      };

      const allOfAfter: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          {
            type: 'object',
            properties: {
              b: { type: 'number' },
            },
          },
          {
            type: 'object',
            properties: {
              a: { type: 'string' },
            },
          },
        ],
      };

      const diffResult = diff(
        objectBefore,
        allOfAfter,
        jsonPointerHelpers.compile([
          'paths',
          '/users',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
        ])
      );

      expect(diffResult.length).toBe(0);
    });
    test('property diff is correct', () => {
      const objectBefore: FlatOpenAPIV3.SchemaObject = {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'number' },
        },
      };

      const allOfAfter: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          {
            type: 'object',
            properties: {
              b: { type: 'number' },
            },
          },
          {
            type: 'object',
            required: ['a'],
            properties: {
              a: { type: 'number' },
            },
          },
        ],
      };

      const diffResult = diff(
        objectBefore,
        allOfAfter,
        jsonPointerHelpers.compile([
          'paths',
          '/users',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
        ])
      );

      expect(diffResult.length).toBe(2);
    });
    test('removals of properties', () => {
      const objectBefore: FlatOpenAPIV3.SchemaObject = {
        type: 'object',
        required: ['a', 'b'],
        properties: {
          a: { type: 'string' },
          b: { type: 'number' },
        },
      };

      const allOfAfter: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          {
            type: 'object',
            properties: {},
          },
          {
            type: 'object',
            properties: {},
          },
        ],
      };

      const diffResult = diff(
        objectBefore,
        allOfAfter,
        jsonPointerHelpers.compile([
          'paths',
          '/users',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
        ])
      );

      expect(diffResult).toMatchSnapshot();
      expect(diffResult.length).toBe(4);
    });
    test('properties made optional', () => {
      const objectBefore: FlatOpenAPIV3.SchemaObject = {
        type: 'object',
        required: ['a', 'b'],
        properties: {
          a: { type: 'string' },
          b: { type: 'number' },
        },
      };

      const allOfAfter: FlatOpenAPIV3.SchemaObject = {
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
              b: { type: 'number' },
            },
          },
        ],
      };

      const diffResult = diff(
        objectBefore,
        allOfAfter,
        jsonPointerHelpers.compile([
          'paths',
          '/users',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
        ])
      );

      expect(diffResult).toMatchSnapshot();
      expect(diffResult.length).toBe(2);
    });
  });
  describe('allOf <> allOf compares properties properly', () => {
    test('no diff when same properties', () => {
      const before: FlatOpenAPIV3.SchemaObject = {
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
              b: { type: 'number' },
            },
          },
        ],
      };

      const after: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          {
            type: 'object',
            properties: {
              b: { type: 'number' },
            },
          },
          {
            type: 'object',
            properties: {
              a: { type: 'string' },
            },
          },
        ],
      };

      const diffResult = diff(
        before,
        after,
        jsonPointerHelpers.compile([
          'paths',
          '/users',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
        ])
      );

      expect(diffResult.length).toBe(0);
    });
    test('diff when made required properties', () => {
      const before: FlatOpenAPIV3.SchemaObject = {
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
              b: { type: 'number' },
            },
          },
        ],
      };

      const after: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          {
            required: ['b'],
            type: 'object',
            properties: {
              b: { type: 'number' },
            },
          },
          {
            type: 'object',
            properties: {
              a: { type: 'string' },
            },
          },
        ],
      };

      const diffResult = diff(
        before,
        after,
        jsonPointerHelpers.compile([
          'paths',
          '/users',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
        ])
      );

      expect(diffResult).toMatchSnapshot();
      expect(diffResult.length).toBe(1);
    });
    test('last property definition wins', () => {
      // this is an impossible set of constraints
      const before: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          {
            type: 'object',
            properties: {
              a: { type: 'number' },
            },
          },
          {
            type: 'object',
            properties: {
              b: { type: 'number' },
              a: { type: 'string' },
            },
          },
        ],
      };

      const after: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          {
            type: 'object',
            properties: {},
          },
          {
            type: 'object',
            properties: {
              b: { type: 'number' },
              a: { type: 'number' },
            },
          },
        ],
      };

      const diffResult = diff(
        before,
        after,
        jsonPointerHelpers.compile([
          'paths',
          '/users',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
        ])
      );

      expect(diffResult).toMatchSnapshot();
      expect(diffResult.length).toBe(1);
    });
    test('other properties work when all objects', () => {
      // this is an impossible set of constraints
      const before: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          {
            title: 'Hello',
            type: 'object',
            properties: {
              a: { type: 'number' },
            },
          },
        ],
      };

      const after: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          {
            title: 'World',
            type: 'object',
            properties: {
              a: { type: 'number' },
            },
          },
        ],
      };

      const diffResult = diff(
        before,
        after,
        jsonPointerHelpers.compile([
          'paths',
          '/users',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
        ])
      );

      expect(diffResult).toMatchSnapshot();
      expect(diffResult.length).toBe(1);
    });
    test('works for nested allOf', () => {
      // this is an impossible set of constraints
      const before: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          {
            type: 'object',
            properties: {
              a: {
                allOf: [
                  { type: 'object', properties: { b: { type: 'string' } } },
                ],
              },
            },
          },
        ],
      };

      const after: FlatOpenAPIV3.SchemaObject = {
        allOf: [
          { type: 'object' }, // being sneaky
          {
            type: 'object',
            properties: {
              a: {
                allOf: [
                  { type: 'object', properties: { b: { type: 'number' } } },
                ],
              },
            },
          },
        ],
      };

      const diffResult = diff(
        before,
        after,
        jsonPointerHelpers.compile([
          'paths',
          '/users',
          'get',
          'responses',
          '200',
          'content',
          'application/json',
          'schema',
        ])
      );

      expect(diffResult).toMatchSnapshot();
      expect(diffResult.length).toBe(2);
    });
  });
});

describe('path reconciliation', () => {
  test('can reconcile objectDiffs with path reconciliation', () => {
    const diff = {
      before: '/parameters/0/nested/schema/removeme',
      pathReconciliation: [[1, '2']],
    } as ObjectDiff;

    expect(reconcileDiff(diff)).toEqual({
      before: '/parameters/2/nested/schema/removeme',
      pathReconciliation: [],
    });
  });
});
