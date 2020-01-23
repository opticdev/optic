import {Command} from '@oclif/command';
import {Client} from '@useoptic/cli-client';
import {getPathsRelativeToConfig, IApiCliConfig, readApiConfig} from '@useoptic/cli-config';
import {IPathMapping} from '@useoptic/cli-config';
import {ensureDaemonStarted} from '@useoptic/cli-server';
import {fromOptic} from '../shared/conversation';
import {developerDebugLogger, userDebugLogger} from '../shared/logger';
import {lockFilePath} from '../shared/paths';
import Init from './init';
import openBrowser = require('react-dev-utils/openBrowser');

export default class Spec extends Command {
  static description = 'Open your Optic API specification';

  async run() {
    let paths: IPathMapping;
    let config: IApiCliConfig;
    try {
      paths = await getPathsRelativeToConfig();
      config = await readApiConfig(paths.configPath);
    } catch (e) {
      userDebugLogger(e);
      this.log(fromOptic('Optic needs more information about your API to continue.'));
      await Init.run([]);
      process.exit(0);
    }
    developerDebugLogger(paths);
    await this.helper(paths.cwd, config);
  }

  async helper(basePath: string, config: IApiCliConfig) {
    const daemonState = await ensureDaemonStarted(lockFilePath);

    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`api base url: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);
    const cliSession = await cliClient.findSession(basePath, null);
    developerDebugLogger({cliSession});
    const uiUrl = `http://localhost:${daemonState.port}/specs/${cliSession.session.id}/dashboard`;
    this.log(fromOptic(`opening ${uiUrl}`));
    openBrowser(uiUrl);
  }
}
