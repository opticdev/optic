import { test, expect, describe } from '@jest/globals';
import { SPEC_TAG_REGEXP } from '../tags';

describe('SPEC_TAG_REGEX', () => {
  test('valid tag', () => {
    expect(SPEC_TAG_REGEXP.test('git:abc123')).toBe(true);
  });

  test('invalid tag - multiple colons', () => {
    expect(SPEC_TAG_REGEXP.test('git:abc123:abc123')).toBe(false);
  });
});
