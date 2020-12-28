import { Command, flags } from '@oclif/command';
//@ts-ignore
import gitRev from '../shared/git/git-rev-sync-insourced.js';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import { Config } from '../config';
import EventSource from 'eventsource';
import {
  cleanupAndExit,
  developerDebugLogger,
  fromOptic,
  loadPathsAndConfig,
  makeUiBaseUrl,
  userDebugLogger,
} from '@useoptic/cli-shared';
import { Client, SpecServiceClient } from '@useoptic/cli-client';
import {
  getCredentials,
  getUserFromCredentials,
} from '../shared/authentication-server';
import { EventEmitter } from 'events';
import {
  getPathsRelativeToConfig,
  IApiCliConfig,
  IPathMapping,
  readApiConfig,
} from '@useoptic/cli-config';
import { getCaptureId } from '../shared/git/git-context-capture';
import fs from 'fs-extra';
import { IgnoreFileHelper } from '@useoptic/cli-config/build/helpers/ignore-file-interface';
import { JsonHttpClient } from '@useoptic/client-utilities';
import colors from 'colors';
import { getUser } from '../shared/analytics';
import openBrowser from 'react-dev-utils/openBrowser';

export default class Status extends Command {
  static description = 'lists API diffs observed since your last git commit';

  async run() {
    let paths: IPathMapping;
    let config: IApiCliConfig;
    try {
      paths = await getPathsRelativeToConfig();
      config = await readApiConfig(paths.configPath);
    } catch (e) {
      userDebugLogger(e);
      this.log(
        fromOptic(
          `No optic.yml file found here. Add Optic to your API by running ${colors.bold(
            'api init'
          )}`
        )
      );
      process.exit(0);
    }
    developerDebugLogger(paths);
    const captureId = getCaptureId(paths);
    const diffsPromise = this.getDiffsAndEvents(paths, captureId, config);

    diffsPromise.then(({ diffs }) => {
      console.log(diffs);
    });

    diffsPromise.catch(() => {
      cleanupAndExit();
    });
  }

  async getDiffsAndEvents(
    paths: IPathMapping,
    captureId: string,
    config: IApiCliConfig
  ) {
    const daemonState = await ensureDaemonStarted(
      lockFilePath,
      Config.apiBaseUrl
    );

    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`api base url: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);
    cliClient.setIdentity(await getUser());
    const cliSession = await cliClient.findSession(paths.cwd, null, null);
    developerDebugLogger({ cliSession });

    const eventEmitter = new EventEmitter();
    const specService = new SpecServiceClient(
      cliSession.session.id,
      eventEmitter,
      apiBaseUrl
    );

    const ignoreHelper = new IgnoreFileHelper(
      paths.opticIgnorePath,
      paths.configPath
    );
    const ignoreRules = (await ignoreHelper.getCurrentIgnoreRules()).allRules;
    const events = await fs.readJSON(paths.specStorePath);

    const captureStatus = specService.getCaptureStatus(captureId);

    const startDiffUrl = `${apiBaseUrl}/specs/${cliSession.session.id}/captures/${captureId}/diffs`;

    const { diffId, notificationsUrl } = await JsonHttpClient.postJson(
      startDiffUrl,
      {
        ignoreRules,
        additionalCommands: [],
        events,
        filters: [],
      }
    );

    const getDiffsUrl = `${apiBaseUrl}/specs/${cliSession.session.id}/captures/${captureId}/diffs/${diffId}/diffs`;

    const notificationChannel = new EventSource(
      `http://localhost:${daemonState.port}` + notificationsUrl
    );

    await new Promise((resolve, reject) => {
      notificationChannel.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data);
        if (type === 'message') {
          resolve();
        } else if (type === 'error') {
          reject();
        }
      };
      notificationChannel.onerror = function (err) {
        reject();
      };
    });

    notificationChannel.close();

    const diffs = await JsonHttpClient.getJson(getDiffsUrl);
    return { diffs, events, captureStatus: await captureStatus };
  }
}
