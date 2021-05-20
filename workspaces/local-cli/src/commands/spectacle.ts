import { Command } from '@oclif/command';
import { Client } from '@useoptic/cli-client';
import {
  getPathsRelativeToConfig,
  IApiCliConfig,
  readApiConfig,
} from '@useoptic/cli-config';
import { IPathMapping } from '@useoptic/cli-config';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import colors from 'colors';
import openBrowser from 'react-dev-utils/openBrowser';
import {
  cleanupAndExit,
  developerDebugLogger,
  fromOptic,
  userDebugLogger,
} from '@useoptic/cli-shared';
import { Config } from '../config';
export default class Spectacle extends Command {
  static description = 'open GraphiQL for Spectacle';

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
          `No optic.yml file found. Add Optic to your API by running ${colors.bold(
            'api init'
          )}`
        )
      );
      process.exit(0);
    }
    developerDebugLogger(paths);
    await this.helper(paths.cwd, config);
  }

  async helper(basePath: string, config: IApiCliConfig) {
    const daemonState = await ensureDaemonStarted(
      lockFilePath,
      Config.apiBaseUrl
    );
    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`api base url: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);
    const cliSession = await cliClient.findSession(basePath, null, null);
    developerDebugLogger({ cliSession });
    const spectacleUrl = `${apiBaseUrl}/specs/${cliSession.session.id}/spectacle`;
    openBrowser(spectacleUrl);
    cleanupAndExit();
  }
}
