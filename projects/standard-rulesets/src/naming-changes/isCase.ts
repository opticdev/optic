import { casing } from './constants';

function regexForRule(format: (typeof casing)[number]) {
  switch (format) {
    case 'camelCase':
      return /^[a-z][a-z0-9]*(?:[A-Z0-9][a-z0-9]+)*$/;
    case 'Capital-Param-Case':
      return /^[A-Z0-9][a-z0-9]*(-[A-Z0-9][a-z0-9]*)*$/;
    case 'param-case':
      return /^[a-z0-9]+(-[a-z0-9]+)*$/;
    case 'PascalCase':
      return /^[A-Z][a-z0-9]+(?:[A-Z0-9][a-z0-9]+)*$/;
    case 'snake_case':
      return /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
    case 'case-insensitive-param-case':
      return /^[a-z0-9]+(-[a-z0-9]+)*$/i;
    default:
      return /(.*?)/;
  }
}

export function isCase(
  example: string,
  format: (typeof casing)[number]
): boolean {
  return regexForRule(format).test(example);
}
