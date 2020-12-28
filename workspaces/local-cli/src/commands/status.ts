import { Command, flags } from '@oclif/command';
//@ts-ignore
import gitRev from '../shared/git/git-rev-sync-insourced.js';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import { Config } from '../config';
import {
  developerDebugLogger,
  fromOptic,
  loadPathsAndConfig,
  makeUiBaseUrl,
} from '@useoptic/cli-shared';
import { Client, SpecServiceClient } from '@useoptic/cli-client';
import {
  getCredentials,
  getUserFromCredentials,
} from '../shared/authentication-server';
import { EventEmitter } from 'events';
import { getCaptureId } from '../shared/local-cli-task-runner';
import { IPathMapping } from '@useoptic/cli-config';

export default class Status extends Command {
  static description = 'lists any APIs diffs since your last git commit';

  static flags = {
    'exit-code': flags.boolean({ default: false }),
  };

  async run() {
    const { paths, config } = await loadPathsAndConfig(this);
    const captureId = getCaptureId(paths);
    const specServiceClient = await newSpecServiceClient(paths, captureId);
    const summary = await specServiceClient.getCaptureStatus(captureId);
  }
}

async function newSpecServiceClient(paths: IPathMapping, captureId: string) {
  const daemonState = await ensureDaemonStarted(
    lockFilePath,
    Config.apiBaseUrl
  );
  const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
  const cliClient = new Client(apiBaseUrl);
  const cliSession = await cliClient.findSession(process.cwd(), null, null);
  const uiBaseUrl = makeUiBaseUrl(daemonState);
  const eventEmitter = new EventEmitter();
  return new SpecServiceClient(cliSession.session.id, eventEmitter, apiBaseUrl);
}
