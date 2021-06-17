import { findLongestCommonPath } from '../findLongestCommonPath';

describe('findLongestCommonPath', () => {
  test('returns the shared start for a list of items', () => {
    const endpointNames = ['/api/list', '/api/:apiId', '/api/todos'];
    expect(findLongestCommonPath(endpointNames)).toBe('/api');
  });

  test('returns the shared start with same letters following slash', () => {
    const endpointNames = ['/api/list', '/api/liststs'];
    expect(findLongestCommonPath(endpointNames)).toBe('/api');
  });

  test('returns the shared start for a single item', () => {
    const endpointNames = ['/api/list'];
    expect(findLongestCommonPath(endpointNames)).toBe('/api/list');
  });

  test('returns / for empty list', () => {
    expect(findLongestCommonPath([])).toBe('/');
  });
});
