import {Command} from '@oclif/command';
import {Client} from '@useoptic/cli-client';
import {getPathsRelativeToConfig, IApiCliConfig, readApiConfig} from '@useoptic/cli-config';
import {ensureDaemonStarted} from '@useoptic/cli-server';
import {fromOptic} from '../shared/conversation';
import {developerDebugLogger, userDebugLogger} from '../shared/logger';
import {lockFilePath} from '../shared/paths';
import Init from './init';
import openBrowser = require('react-dev-utils/openBrowser');

export default class Spec extends Command {
  static description = 'Open your Optic API specification';

  async run() {
    try {
      const {configPath} = await getPathsRelativeToConfig();
      const config = await readApiConfig(configPath);
      await this.helper(configPath, config);
    } catch (e) {
      userDebugLogger(e);
      this.log(fromOptic('Optic needs more information about your API to continue.'));
      await Init.run([]);
      process.exit(0);
    }
  }

  async helper(configPath: string, config: IApiCliConfig) {
    const daemonState = await ensureDaemonStarted(lockFilePath);

    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`api base url: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);
    const cliSession = await cliClient.findSession(configPath, null);
    developerDebugLogger({cliSession});
    const uiUrl = `http://localhost:${daemonState.port}/specs/${cliSession.session.id}`;
    this.log(fromOptic(`opening ${uiUrl}`));
    openBrowser(uiUrl);
  }
}
