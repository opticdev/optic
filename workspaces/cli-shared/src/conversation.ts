import * as colors from 'colors';
import { promise as OraPromise, Options as OraOptions } from 'ora';

export function fromOptic(msg: string) {
  return msg
    .split('\n')
    .map((line) => `${colors.cyan('[optic]')} ${line}`)
    .join('\n');
}

export function errorFromOptic(msg: string) {
  return msg
    .split('\n')
    .map((line) => `${colors.cyan('[optic]')} ${colors.red(line)}`)
    .join('\n');
}

export function warningFromOptic(msg: string) {
  return msg
    .split('\n')
    .map((line) => `${colors.cyan('[optic]')} ${colors.yellow(line)}`)
    .join('\n');
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
