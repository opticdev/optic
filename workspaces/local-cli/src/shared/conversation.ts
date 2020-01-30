import * as colors from 'colors';

export function fromOptic(string: string) {
  return `${colors.cyan('[optic]')} ${string}`;
}
