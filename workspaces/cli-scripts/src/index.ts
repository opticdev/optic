import * as cp from 'child_process';

export const basePath: string = __dirname;

export function runStandaloneScript(modulePath: string, ...args: string[]) {
  const child = cp.fork(modulePath, args, { detached: true, stdio: 'ignore' });
  return child;
}
