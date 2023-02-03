import { test, expect, describe } from '@jest/globals';
import { sanitizeGitTag, SPEC_TAG_REGEXP } from '../tags';

describe('SPEC_TAG_REGEX', () => {
  test('valid tag', () => {
    expect(SPEC_TAG_REGEXP.test('git:abc123')).toBe(true);
    expect(SPEC_TAG_REGEXP.test('git:feat/abc/i/like/cheese')).toBe(true);
  });

  test('invalid tag - multiple colons', () => {
    expect(SPEC_TAG_REGEXP.test('git:abc123:abc123')).toBe(false);
  });
});

describe('sanitizeGitTag', () => {
  test.each([
    ['git:feat/bla$h/bad-', 'git:feat/blah/bad-'],
    ['git:123.but.this.thing', 'git:123butthisthing'],
  ])('sanitizes git tag %s', (tag, expected) => {
    expect(SPEC_TAG_REGEXP.test(tag)).toBe(false);
    const sanitized = sanitizeGitTag(tag);
    expect(SPEC_TAG_REGEXP.test(sanitized)).toBe(true);
    expect(sanitized).toBe(expected);
  });
});
