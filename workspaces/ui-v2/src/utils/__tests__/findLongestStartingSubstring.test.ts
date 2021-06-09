import { findLongestStartingSubstring } from '../findLongestStartingSubstring';

describe('findLongestStartingSubstring', () => {
  test('returns the shared start for a list of items', () => {
    const endpointNames = ['/api/list', '/api/:apiId', '/api/todos'];
    expect(findLongestStartingSubstring(endpointNames)).toBe('/api/');
  });

  test('returns the shared start for a single item', () => {
    const endpointNames = ['/api/list'];
    expect(findLongestStartingSubstring(endpointNames)).toBe('/api/list');
  });

  test('returns / for empty list', () => {
    expect(findLongestStartingSubstring([])).toBe('');
  });
});
