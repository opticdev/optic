import * as colors from 'colors';

export function fromOptic(string: string) {
  return `${colors.cyan('[optic]')} ${string}`;
}
export function errorFromOptic(string: string) {
  return `${colors.cyan('[optic]')} ${colors.red(string)}`;
}
