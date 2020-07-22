import cp from 'child_process';
import path from 'path';

export const basePath: string = __dirname;

export function runStandaloneScript(modulePath: string, ...args: string[]) {
  const child = cp.fork(modulePath, args, { detached: true, stdio: 'ignore' });
  return child;
}

export function runScriptByName(name: string, ...args: string[]) {
  return runStandaloneScript(path.join(basePath, name), ...args);
}

export function runManagedScript(modulePath: string, ...args: string[]) {
  //@GOTCHA: execArgv is inherited from the parent, so if you are using --inspect in the parent, the child will fail
  // instead, you can use --inspect=0 or --inspect=<some specific non-colliding port>

  const isDebuggingEnabled =
    process.env.OPTIC_DAEMON_ENABLE_DEBUGGING === 'yes';
  // const execArgv = isDebuggingEnabled ? ['--inspect=63694'] : []; // not in spawn
  const child = cp.spawn(process.argv0, [modulePath, ...args], {
    windowsHide: true,
    stdio: ['ipc'],
  });
  return child;
}

export function runManagedScriptByName(name: string, ...args: string[]) {
  return runManagedScript(path.join(basePath, name), ...args);
}
