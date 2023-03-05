import { describe, test, expect } from '@jest/globals';
import { diff, ObjectDiff, reconcileDiff } from '../diff';
import { before, after } from './mock-data';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

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
