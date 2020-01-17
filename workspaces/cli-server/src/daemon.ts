import * as lockfile from 'proper-lockfile';
import {userDebugLogger} from './logger';
import {CliServer, shutdownRequested} from './server';
import * as fs from 'fs-extra';

export interface ICliDaemon {

}

export interface ICliDaemonConfig {
  lockFilePath: string
}

class CliDaemon {
  private apiServer!: CliServer;

  constructor(private config: ICliDaemonConfig) {

  }

  async start() {
    await this.acquireInstanceLock();
    const output = await this.startApiServer();
    return output;
  }

  async acquireInstanceLock() {
    await lockfile.lock(this.config.lockFilePath);
  }

  async releaseInstanceLock() {
    await lockfile.unlock(this.config.lockFilePath);
    await fs.unlink(this.config.lockFilePath);
  }

  async startApiServer() {
    this.apiServer = new CliServer({jwtSecret: 'notverysecret'});
    this.apiServer.events.on(shutdownRequested, () => {
      userDebugLogger('shutting down daemon');
      this.stop();
    });
    const apiServerInfo = await this.apiServer.start();
    await fs.writeJson(this.config.lockFilePath, apiServerInfo);
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

export {
  CliDaemon
};
