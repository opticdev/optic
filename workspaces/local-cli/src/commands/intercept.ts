import {Command} from '@oclif/command';
import {Client} from '@useoptic/cli-client';
import {getPathsRelativeToCwd} from '@useoptic/cli-config';
import {ensureDaemonStarted, ensureDaemonStopped, FileSystemCaptureSaver} from '@useoptic/cli-server';
import {cli} from 'cli-ux';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs-extra';
import {developerDebugLogger} from '../shared/logger';
import {lockFilePath} from '../shared/paths';
import {runTask} from '../shared/run-task';
import * as uuidv4 from 'uuid/v4';
import openBrowser = require('react-dev-utils/openBrowser');

export default class Intercept extends Command {
  static description = 'Starts a proxy that will intercept all requests';

  async run() {
    const cwd = path.join(os.homedir(), '.optic');
    await fs.ensureDir(cwd);
    await getPathsRelativeToCwd(cwd);
    const captureId = uuidv4();

    const daemonState = await ensureDaemonStarted(lockFilePath);

    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`api started on: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);
    //@TODO: add some metadata so daemon has information it needs to save in the correct place
    const cliSession = await cliClient.findSession(cwd, captureId);
    developerDebugLogger({cliSession});
    const uiUrl = `http://localhost:${daemonState.port}/specs/${cliSession.session.id}`;
    this.log(uiUrl);
    openBrowser(uiUrl);

    // start proxy and command session
    const persistenceManagerFactory = () => {
      return new FileSystemCaptureSaver({
        captureBaseDirectory: path.join(cwd, 'captures')
      });
    };

    await runTask(
      captureId,
      {baseUrl: '/'},
      cliClient,
      persistenceManagerFactory
    );
  }
}
