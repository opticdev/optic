import {Client} from '@useoptic/cli-client';
import {IIgnoreRunnable} from '@useoptic/cli-config';
import {IApiInteraction} from '@useoptic/proxy';
import * as lockfile from 'proper-lockfile';
import {CliDaemon} from './daemon';
import {fork} from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import {FileSystemCaptureSaver} from './file-system-capture-saver';
import {FileSystemCaptureLoader} from './file-system-capture-loader';
import {makeUiBaseUrl} from './url-builders';
import {developerDebugLogger} from './logger';
import waitOn from 'wait-on';
import findProcess = require('find-process');

export interface ICaptureManifest {
  samples: IApiInteraction[]
}

export interface ICaptureLoader {
  load(captureId: string): Promise<ICaptureManifest>

  loadWithFilter(captureId: string, filter: IIgnoreRunnable): Promise<ICaptureManifest>
}

export interface ICaptureSaver {
  init(captureId: string): Promise<void>

  save(sample: IApiInteraction): Promise<void>
}

export interface ICliDaemonState {
  port: number
}

export async function ensureDaemonStarted(lockFilePath: string): Promise<ICliDaemonState> {
  if (process.env.OPTIC_ENV === 'development') {
    await ensureDaemonStopped(lockFilePath);
  }
  const fileExisted = await fs.pathExists(lockFilePath);
  if (!fileExisted) {
    await fs.ensureFile(lockFilePath);
    await fs.writeJson(lockFilePath, {});
  }
  await fs.ensureDir(path.dirname(lockFilePath));
  const isLocked = await lockfile.check(lockFilePath);
  if (isLocked && !fileExisted) {
    developerDebugLogger('lockfile was missing but locked')
  }
  if (!isLocked) {
    const isDebuggingEnabled = process.env.OPTIC_DAEMON_ENABLE_DEBUGGING === 'yes';
    if (isDebuggingEnabled) {
      developerDebugLogger(`node --inspect debugging enabled. go to chrome://inspect and open the node debugger`);
    }
    // fork process
    const child = fork(
      path.join(__dirname, 'main'),
      [lockFilePath],
      {
        execArgv: isDebuggingEnabled ? ['--inspect'] : [],
        detached: true,
        stdio: 'ignore'
      }
    );

    await new Promise(async (resolve) => {
      developerDebugLogger(`waiting for lock ${child.pid}`);
      await waitOn({
        resources: [
          `file://${lockFilePath}`
        ],
        delay: 500,
        window: 250
      });
      developerDebugLogger(`lock created ${child.pid}`);
      resolve();
    });
  }
  const contents = await fs.readJson(lockFilePath);
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
  const {port} = contents;
  const apiBaseUrl = `http://localhost:${port}/admin-api`;
  const cliClient = new Client(apiBaseUrl);
  try {
    developerDebugLogger('sending shutdown request')
    await cliClient.stopDaemon();
    developerDebugLogger('sent shutdown request')
  } catch (e) {
    developerDebugLogger(e);
    try {
      await lockfile.unlock(lockFilePath);
    } catch (e) {
      developerDebugLogger(e);
      const blockers = await findProcess('port', port);
      if (blockers.length > 0) {
        developerDebugLogger(blockers);
        blockers.forEach(b => process.kill(b.pid, 9));
      }
    }
    await fs.unlink(lockFilePath);
  }
}


export {
  CliDaemon,
  FileSystemCaptureSaver,
  FileSystemCaptureLoader,
  makeUiBaseUrl
};
