import { pathMatcher } from '../pathMatcher';

test('generates a matcher expression from a path', () => {
  const matcher = pathMatcher([
    { part: '', isParameterized: false },
    { part: 'api', isParameterized: false },
    { part: '123', isParameterized: true },
    { part: 'hello', isParameterized: false },
  ]);

  expect(matcher('/api/some_other_path/hello')).toBe(true);
  expect(matcher('/api/123/hello')).toBe(true);
  expect(matcher('/api/123')).toBe(false);
});

test('generates a matcher with special characters', () => {
  const matcher = pathMatcher([
    { part: '', isParameterized: false },
    { part: 'api', isParameterized: false },
    { part: '123', isParameterized: true },
    { part: 'hel-lo[', isParameterized: false },
    { part: '**', isParameterized: false },
  ]);

  expect(matcher('/api/some_other_path/hel-lo[/**')).toBe(true);
  expect(matcher('/api/123/hel-lo[/**')).toBe(true);
  expect(matcher('/api/123/hel-lo[/*')).toBe(false);
});

test('treats dashes as the same named path parameter', () => {
  const matcher = pathMatcher([
    { part: '', isParameterized: false },
    { part: 'api', isParameterized: false },
    { part: 'some-other-path', isParameterized: true },
    { part: 'feed', isParameterized: false },
  ]);

  expect(matcher('/api/someother_path/feed')).toBe(true);
  expect(matcher('/api/123/feed')).toBe(true);
  expect(matcher('/api/123/notfeed')).toBe(false);
});

test('handles named path parameters with multiple colons', () => {
  const matcherColonStart = pathMatcher([
    { part: '', isParameterized: false },
    { part: 'api', isParameterized: false },
    { part: ':::hello', isParameterized: true },
    { part: 'feed', isParameterized: false },
  ]);
  const matcherColonMiddle = pathMatcher([
    { part: '', isParameterized: false },
    { part: 'api', isParameterized: false },
    { part: ':hel:lo', isParameterized: true },
    { part: 'feed', isParameterized: false },
  ]);

  for (const matcher of [matcherColonStart, matcherColonMiddle]) {
    expect(matcher('/api/someother_path/feed')).toBe(true);
    expect(matcher('/api/123/feed')).toBe(true);
    expect(matcher('/api/123/notfeed')).toBe(false);
  }
});

test('treats special characters as the same named path parameter', () => {
  const matcherWithPlus = pathMatcher([
    { part: '', isParameterized: false },
    { part: 'api', isParameterized: false },
    { part: ':+', isParameterized: true },
    { part: 'feed', isParameterized: false },
  ]);
  const matcherWithSpecialCharactersInBetween = pathMatcher([
    { part: '', isParameterized: false },
    { part: 'api', isParameterized: false },
    { part: ':abc+def', isParameterized: true },
    { part: 'feed', isParameterized: false },
  ]);

  for (const matcher of [
    matcherWithPlus,
    matcherWithSpecialCharactersInBetween,
  ]) {
    expect(matcher('/api/someother_path/feed')).toBe(true);
    expect(matcher('/api/123/feed')).toBe(true);
    expect(matcher('/api/123/notfeed')).toBe(false);
  }
});
