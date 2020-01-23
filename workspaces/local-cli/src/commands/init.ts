import Command from '@oclif/command';
import {createFileTree, IApiCliConfig} from '@useoptic/cli-config';
import * as colors from 'colors';
import cli from 'cli-ux';
import {ensureDaemonStarted} from '@useoptic/cli-server';
import {fromOptic} from '../shared/conversation';
import {developerDebugLogger} from '../shared/logger';
import {lockFilePath} from '../shared/paths';
import {Client} from '@useoptic/cli-client';
import * as uuidv4 from 'uuid/v4';
import openBrowser = require('react-dev-utils/openBrowser.js');

export default class Init extends Command {
  static description = 'Add Optic to your API';

  async run() {
    const cwd = process.cwd();
    const shouldUseThisDirectory = await cli.confirm(`${colors.bold.blue(cwd)}\nIs this your API's root directory? (yes/no)`);

    if (!shouldUseThisDirectory) {
      this.log(colors.red(`Optic must be initialized in your API's root directory. Change your working directory and then run ${colors.bold('api init')} again`));
      process.exit(1);
    }

    const config: IApiCliConfig = {
      name: 'Unnamed API',
      tasks: {
        start: {
          command: 'echo "Setup A Valid Command to Start your API!"',
          baseUrl: 'http://localhost:4000'
        }
      },
      ignoreRequests: [
        'OPTIONS *'
      ]
    };
    //write initial config
    await createFileTree(config, cwd);

    //open init flow in the UI
    const daemonState = await ensureDaemonStarted(lockFilePath);
    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`optic api base url: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);
    const cliSession = await cliClient.findSession(cwd, null);
    developerDebugLogger({cliSession});
    const uiUrl = `http://localhost:${daemonState.port}/specs/${cliSession.session.id}/init`;
    cli.log(fromOptic(`opening ${uiUrl}`));
    openBrowser(uiUrl);
    process.exit();
  }

}
