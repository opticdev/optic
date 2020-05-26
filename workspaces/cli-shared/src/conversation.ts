import * as colors from 'colors';
import { promise as OraPromise, Options as OraOptions } from 'ora';

export function fromOptic(string: string) {
  return `${colors.cyan('[optic]')} ${string}`;
}
export function errorFromOptic(string: string) {
  return `${colors.cyan('[optic]')} ${colors.red(string)}`;
}

export function promiseFromOptic(
  promise: PromiseLike<unknown>,
  msgOrOptions: string | OraOptions
) {
  let options =
    typeof msgOrOptions === 'string'
      ? {
          text: msgOrOptions,
        }
      : msgOrOptions;

  return OraPromise(promise, {
    ...options,
    prefixText: colors.cyan('[optic]'),
  });
}

export { colors };
