import { pathMatcher, urlStringToPathComponents } from '../pathMatcher';

test('generates a matcher expression from a path', () => {
  const matcher = pathMatcher(
    urlStringToPathComponents('/api/123/hello').map((part) => {
      if (part.name === '123') {
        part.isParameter = true;
      }
      return part;
    })
  );

  expect(matcher('/api/some_other_path/hello')).toBe(true);
  expect(matcher('/api/123/hello')).toBe(true);
  expect(matcher('/api/123')).toBe(false);
});

test('generates a matcher with special characters', () => {
  const matcher = pathMatcher(
    urlStringToPathComponents('/api/123/hel-lo[/**').map((part) => {
      if (part.name === '123') {
        part.isParameter = true;
      }
      return part;
    })
  );

  expect(matcher('/api/some_other_path/hel-lo[/**')).toBe(true);
  expect(matcher('/api/123/hel-lo[/**')).toBe(true);
  expect(matcher('/api/123/hel-lo[/*')).toBe(false);
});

test('treats dashes as the same named path parameter', () => {
  const matcher = pathMatcher(
    urlStringToPathComponents('/api/some-other-path/feed').map((part) => {
      if (part.name === 'some-other-path') {
        part.isParameter = true;
      }
      return part;
    })
  );

  expect(matcher('/api/someother_path/feed')).toBe(true);
  expect(matcher('/api/123/feed')).toBe(true);
  expect(matcher('/api/123/notfeed')).toBe(false);
});

test('handles named path parameters with multiple colons', () => {
  const matcherColonStart = pathMatcher(
    urlStringToPathComponents('/api/:::hello/feed').map((part) => {
      if (part.name === ':::hello') {
        part.isParameter = true;
      }
      return part;
    })
  );
  const matcherColonMiddle = pathMatcher(
    urlStringToPathComponents('/api/:hel:lo/feed').map((part) => {
      if (part.name === ':hel:lo') {
        part.isParameter = true;
      }
      return part;
    })
  );

  for (const matcher of [matcherColonStart, matcherColonMiddle]) {
    expect(matcher('/api/someother_path/feed')).toBe(true);
    expect(matcher('/api/123/feed')).toBe(true);
    expect(matcher('/api/123/notfeed')).toBe(false);
  }
});

test('treats special characters as the same named path parameter', () => {
  const matcherWithPlus = pathMatcher(
    urlStringToPathComponents('/api/:+/feed').map((part) => {
      if (part.name === ':+') {
        part.isParameter = true;
      }
      return part;
    })
  );
  const matcherWithSpecialCharactersInBetween = pathMatcher(
    urlStringToPathComponents('/api/:abc+def/feed').map((part) => {
      if (part.name === ':abc+def') {
        part.isParameter = true;
      }
      return part;
    })
  );

  for (const matcher of [
    matcherWithPlus,
    matcherWithSpecialCharactersInBetween,
  ]) {
    expect(matcher('/api/someother_path/feed')).toBe(true);
    expect(matcher('/api/123/feed')).toBe(true);
    expect(matcher('/api/123/notfeed')).toBe(false);
  }
});
