import { pathToRegexpEscaped } from '../pathToRegexpEscaped';

test('generates a regexp expression from a path', () => {
  const regex = pathToRegexpEscaped('/api/:123/hello');

  expect(regex.test('/api/some_other_path/hello')).toBe(true);
  expect(regex.test('/api/123/hello')).toBe(true);
  expect(regex.test('/api/123')).toBe(false);
});

test('generates a regexp with special characters', () => {
  const regex = pathToRegexpEscaped('/api/:123/hel-lo[/**');

  expect(regex.test('/api/some_other_path/hel-lo[/**')).toBe(true);
  expect(regex.test('/api/123/hel-lo[/**')).toBe(true);
  expect(regex.test('/api/123/hel-lo[/*')).toBe(false);
});

test('treats dashes as the same named path parameter', () => {
  const regex = pathToRegexpEscaped('/api/:some-other-path/feed');

  expect(regex.test('/api/someother_path/feed')).toBe(true);
  expect(regex.test('/api/123/feed')).toBe(true);
  expect(regex.test('/api/123/notfeed')).toBe(false);
});

test('treats special characters as the same named path parameter', () => {
  const regexWithPlus = pathToRegexpEscaped('/api/:+/feed');
  const regexWithSpecialCharactersInBetween = pathToRegexpEscaped(
    '/api/:abc+def/feed'
  );

  for (const regex of [regexWithPlus, regexWithSpecialCharactersInBetween]) {
    expect(regex.test('/api/someother_path/feed')).toBe(true);
    expect(regex.test('/api/123/feed')).toBe(true);
    expect(regex.test('/api/123/notfeed')).toBe(false);
  }
});
