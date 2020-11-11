import { Client } from '@useoptic/cli-client';
import lockfile from 'proper-lockfile';
import { CliDaemon } from './daemon';
import { fork } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import findProcess from 'find-process';
import * as uuid from 'uuid';
import {
  delay,
  developerDebugLogger,
  ICliDaemonState,
} from '@useoptic/cli-shared';
//@REFACTOR with xstate
async function waitForFile(
  path: string,
  options: { intervalMilliseconds: number; timeoutMilliseconds: number }
): Promise<void> {
  let fileWatcherIsDone = false;
  const timeout = delay(options.timeoutMilliseconds).then(() => {
    if (fileWatcherIsDone) {
      return;
    }
    developerDebugLogger('timed out waiting for file');
    return Promise.reject(new Error('timed out waiting for file'));
  });
  const fileWatcher = new Promise<void>((resolve, reject) => {
    const intervalId = setInterval(() => {
      const exists = fs.existsSync(path);
      if (exists) {
        developerDebugLogger('saw file!');
        clearInterval(intervalId);
        fileWatcherIsDone = true;
        resolve();
      } else {
        developerDebugLogger('did not see file, polling');
      }
    }, options.intervalMilliseconds);
    timeout.finally(() => {
      clearInterval(intervalId);
    });
  });
  return Promise.race([timeout, fileWatcher]);
}
export async function ensureDaemonStarted(
  lockFilePath: string,
  cloudApiBaseUrl: string
): Promise<ICliDaemonState> {
  const fileExisted = await fs.pathExists(lockFilePath);
  if (!fileExisted) {
    await fs.ensureFile(lockFilePath);
    await fs.writeJson(lockFilePath, {});
  }
  await fs.ensureDir(path.dirname(lockFilePath));
  const isLocked = await lockfile.check(lockFilePath);
  developerDebugLogger({ isLocked });
  if (isLocked && !fileExisted) {
    developerDebugLogger('lockfile was missing but locked');
  }
  if (!isLocked) {
    const isDebuggingEnabled =
      process.env.OPTIC_DAEMON_ENABLE_DEBUGGING === 'yes';
    if (isDebuggingEnabled) {
      developerDebugLogger(
        `node --inspect debugging enabled. go to chrome://inspect and open the node debugger`
      );
    }
    const sentinelFileName = uuid.v4();
    const sentinelFilePath = path.join(
      path.dirname(lockFilePath),
      sentinelFileName
    );
    // fork process
    const child = fork(
      path.join(__dirname, 'main'),
      [lockFilePath, sentinelFilePath, cloudApiBaseUrl],
      {
        execArgv: isDebuggingEnabled ? ['--inspect'] : [],
        detached: true,
        stdio: 'ignore',
      }
    );
    child.unref();

    await new Promise(async (resolve, reject) => {
      developerDebugLogger(
        `waiting for lock ${child.pid} sentinel file ${sentinelFilePath}`
      );
      try {
        await waitForFile(sentinelFilePath, {
          intervalMilliseconds: 50,
          timeoutMilliseconds: 10000,
        });
      } catch (e) {
        reject(e);
      }
      await fs.unlink(sentinelFilePath);

      developerDebugLogger(`lock created ${child.pid}`);
      resolve();
    });
  }
  developerDebugLogger(`trying to read contents`);
  const contents = await fs.readJson(lockFilePath);
  developerDebugLogger(
    `could read contents ${JSON.stringify(contents.toString)}`
  );
  return contents;
}

export async function ensureDaemonStopped(lockFilePath: string): Promise<void> {
  const fileExists = await fs.pathExists(lockFilePath);
  if (!fileExists) {
    developerDebugLogger('lockfile not present');
    return;
  }
  const isLocked = await lockfile.check(lockFilePath);
  if (!isLocked) {
    developerDebugLogger('lockfile present but not locked');
    return;
  }

  const contents = await fs.readJson(lockFilePath);
  const { port } = contents;
  const apiBaseUrl = `http://localhost:${port}/admin-api`;
  const cliClient = new Client(apiBaseUrl);
  try {
    developerDebugLogger('sending shutdown request');
    await cliClient.stopDaemon();
    developerDebugLogger('sent shutdown request');
  } catch (e) {
    developerDebugLogger(e);
    try {
      await lockfile.unlock(lockFilePath);
    } catch (e) {
      developerDebugLogger(e);
      const blockers = await findProcess('port', port);
      if (blockers.length > 0) {
        developerDebugLogger(blockers);
        blockers.forEach((b) => {
          developerDebugLogger(`killing PID ${b.pid}`);
          process.kill(b.pid, 9);
        });
      }
    }
    await fs.unlink(lockFilePath);
  }
}

export { CliDaemon };
