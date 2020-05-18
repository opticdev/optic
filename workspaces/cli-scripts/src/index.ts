import * as cp from 'child_process';
import * as path from 'path';

export const basePath: string = __dirname;

export function runStandaloneScript(modulePath: string, ...args: string[]) {
  const child = cp.fork(modulePath, args, { detached: true, stdio: 'ignore' });
  return child;
}

export function runScriptByName(name: string, ...args: string[]) {
  return runStandaloneScript(path.join(basePath, name), ...args);
}
