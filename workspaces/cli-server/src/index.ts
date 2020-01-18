import {Client} from '@useoptic/cli-client';
import {IApiInteraction} from '@useoptic/proxy';
import * as lockfile from 'proper-lockfile';
import {CliDaemon} from './daemon';
import {fork} from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import {FileSystemCaptureSaver} from './file-system-session-persistence';
import {FileSystemCaptureLoader} from './file-system-session-loader';

export interface ISessionManifest {
  samples: IApiInteraction[]
}

export interface ICaptureLoader {
  load(sessionId: string): Promise<ISessionManifest>
}

export interface ICaptureSaver {
  init(sessionId: string): Promise<void>

  save(sample: IApiInteraction): Promise<void>
}

export interface ICliDaemonState {
  port: number
}

export async function ensureDaemonStarted(lockFilePath: string): Promise<ICliDaemonState> {
  if (process.env.OPTIC_ENV === 'development') {
    await ensureDaemonStopped(lockFilePath);
  }
  await fs.ensureFile(lockFilePath);
  const isLocked = await lockfile.check(lockFilePath);
  if (!isLocked) {
    // fork process
    const child = fork(path.join(__dirname, 'main'), [lockFilePath], {detached: true});
    await new Promise((resolve) => {
      child.on('message', (message: { type: string }) => {
        if (message && message.type === 'daemon:started') {
          resolve();
        }
      });
    });
  }
  const contents = await fs.readJson(lockFilePath);
  return contents;
}

export async function ensureDaemonStopped(lockFilePath: string): Promise<void> {
  const fileExists = await fs.pathExists(lockFilePath);
  if (!fileExists) {
    return;
  }
  const isLocked = await lockfile.check(lockFilePath);
  if (!isLocked) {
    return;
  }

  const contents = await fs.readJson(lockFilePath);
  const {port} = contents;
  const apiBaseUrl = `http://localhost:${port}/admin-api`;
  const cliClient = new Client(apiBaseUrl);
  await cliClient.stopDaemon();
}


export {
  CliDaemon,
  FileSystemCaptureSaver,
  FileSystemCaptureLoader
};
