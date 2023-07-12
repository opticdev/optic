import { test, expect, describe } from '@jest/globals';
import { matchPathPattern } from '../pathPatterns';

describe('matchPathPattern', () => {
  test('returns true when pattern matches path', () => {
    expect(
      matchPathPattern('/orgs/{orgId}/users/{userId}', '/orgs/123/users/123')
    ).toEqual({ match: true, exact: false });
  });

  test('returns true when pattern matches path with pattern', () => {
    expect(matchPathPattern('/orgs/settings', '/orgs/settings')).toEqual({
      match: true,
      exact: true,
    });
  });

  test('returns false when pattern is a different length', () => {
    expect(
      matchPathPattern('/orgs/{orgId}/users/{userId}', '/orgs/users/123')
    ).toEqual({ match: false });
  });

  test('returns false when pattern is not an exact match', () => {
    expect(matchPathPattern('/orgs/settings', '/orgs/others')).toEqual({
      match: false,
    });
  });

  test('returns false when pattern is not a pattern match', () => {
    expect(
      matchPathPattern('/orgs/{orgId}/users/{userId}', '/orgs/123/projects/123')
    ).toEqual({ match: false });
  });
});
