import { findLongestCommonPath } from '../findLongestCommonPath';

describe('findLongestCommonPath', () => {
  test('returns the shared start for a list of items', () => {
    const endpointNames = ['/api/list', '/api/:apiId', '/api/todos'].map((s) =>
      s.split('/')
    );
    expect(findLongestCommonPath(endpointNames)).toBe('/api');
  });

  test('returns the shared start with same letters following slash', () => {
    const endpointNames = ['/api/list', '/api/liststs'].map((s) =>
      s.split('/')
    );
    expect(findLongestCommonPath(endpointNames)).toBe('/api');
  });

  test('returns the shared start for a single item', () => {
    const endpointNames = ['/api/list'].map((s) => s.split('/'));
    expect(findLongestCommonPath(endpointNames)).toBe('/api/list');
  });

  test('returns / for empty list', () => {
    expect(findLongestCommonPath([])).toBe('/');
  });
});
