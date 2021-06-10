import { pathToRegexp } from 'path-to-regexp';

const specialCharactersRegex = /[.*+?^${}()|[\]\\]/g;

// Special characters need to be escaped to be created as a regexp
const replaceSpecialCharacters = (s: string) =>
  s.replace(specialCharactersRegex, '\\$&');

// The pathToRegexp lib doesn't treat `-` as the same path parameter
const replaceDashWithUnderscoreInNamedParameter = (s: string) =>
  s
    .split('/')
    .map((part) => (part.startsWith(':') ? part.replace(/-/g, '_') : part))
    .join('/');

// @gotcha this swallows query parameters - it's more appropriate that this function doesn't use query parameters
// We want to be looser with our definition of path parameters so we'll remove special characters
// the only thing the name after : is used for is group matching
const replaceSpecialCharactersInNamedParameter = (s: string) =>
  s
    .split('/')

    .map((part) =>
      part.startsWith(':')
        ? part.replace(specialCharactersRegex, '') + 'a' // The regexp lib expects at least 1 character after a :
        : part
    )
    .join('/');

export const pathToRegexpEscaped: typeof pathToRegexp = (path, ...args) => {
  const escapedPath =
    typeof path === 'string'
      ? replaceSpecialCharacters(
          replaceDashWithUnderscoreInNamedParameter(
            replaceSpecialCharactersInNamedParameter(path)
          )
        )
      : path;

  return pathToRegexp(escapedPath, ...args);
};
