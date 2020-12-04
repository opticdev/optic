import fs from 'fs-extra';
import lockfile from 'proper-lockfile';
import { delay, ICliDaemonState, userDebugLogger } from '@useoptic/cli-shared';
import { CliServer, shutdownRequested } from './server';

export interface ICliDaemonConfig {
  lockFilePath: string;
  cloudApiBaseUrl: string;
}

class CliDaemon {
  private apiServer!: CliServer;
  private releaseLock!: () => Promise<void>;

  constructor(private config: ICliDaemonConfig) {}

  async start() {
    await this.acquireInstanceLock();
    const output = await this.startApiServer();
    console.log(JSON.stringify(output));
    return output;
  }

  async acquireInstanceLock() {
    console.log(`acquiring lock`);
    this.releaseLock = await lockfile.lock(this.config.lockFilePath);
    console.log(`acquired lock`);
    const fileExists = await fs.pathExists(this.config.lockFilePath);
    if (fileExists) {
      console.log(`something exists at lock, deleting`);
      await fs.unlink(this.config.lockFilePath);
    }
  }

  async releaseInstanceLock() {
    await this.releaseLock();
    await fs.unlink(this.config.lockFilePath);
  }

  async startApiServer() {
    this.apiServer = new CliServer({
      cloudApiBaseUrl: this.config.cloudApiBaseUrl,
    });
    this.apiServer.events.on(shutdownRequested, () => {
      userDebugLogger('shutting down daemon');
      this.stop();
    });
    const apiServerInfo = await this.apiServer.start();
    const lockFileInfo: ICliDaemonState = {
      ...apiServerInfo,
      pid: process.pid,
    };
    await fs.writeJson(this.config.lockFilePath, lockFileInfo);
    return apiServerInfo;
  }

  async stopApiServer() {
    if (this.apiServer) {
      await this.apiServer.stop();
    }
  }

  async stop() {
    await this.stopApiServer();
    await this.releaseInstanceLock();
    process.exit(0);
  }
}

export { CliDaemon };
