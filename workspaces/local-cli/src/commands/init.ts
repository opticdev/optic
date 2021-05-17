import { Command, flags } from '@oclif/command';
// @ts-ignore
import {
  createFileTree,
  getPathsRelativeToConfig,
  readApiConfig,
} from '@useoptic/cli-config';
import colors from 'colors';
import cli from 'cli-ux';
import fs from 'fs-extra';
import path from 'path';
// @ts-ignore
import {
  developerDebugLogger,
  fromOptic,
  makeUiBaseUrl,
} from '@useoptic/cli-shared';
import { trackUserEvent } from '../shared/analytics';
import { ApiInitializedInProject } from '@useoptic/analytics/lib/events/onboarding';
import { buildTask } from '@useoptic/cli-config/build/helpers/initial-task';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from '../shared/paths';
import { Config } from '../config';
import { Client } from '@useoptic/cli-client';
import openBrowser from 'react-dev-utils/openBrowser';
import { linkToSetup } from '../shared/ui-links';

export default class Init extends Command {
  static description = 'add Optic to your API';

  static flags = {
    inboundUrl: flags.string({}),
    targetUrl: flags.string({}),
    command: flags.string({}),
  };

  async run() {
    const cwd = process.cwd();
    const { flags } = this.parse(Init);

    if (
      fs.existsSync(path.join(cwd, 'optic.yml')) &&
      Object.entries(flags).length === 0
    ) {
      return this.log(
        colors.red(
          `This directory already has an ${colors.bold('optic.yml')} file.\r\n`
        ),
        colors.yellow(
          `You can see the current documentation for this project with ${colors.bold(
            'api spec'
          )}.`
        )
      );
    }

    const shouldUseThisDirectory = await cli.confirm(
      `${colors.bold.blue(cwd)}\nIs this your API's root directory? (yes/no)`
    );

    if (!shouldUseThisDirectory) {
      this.log(
        colors.red(
          `Optic must be initialized in your API's root directory. Change your working directory and then run ${colors.bold(
            'api init'
          )} again`
        )
      );
      process.exit(1);
    }

    const name = await cli.prompt('What is this API named?');

    //bring me back with an ID please
    // await trackAndSpawn('New API Created', { name });

    const config = buildTask(
      name,
      flags,
      flags.inboundUrl && flags.targetUrl ? 'start-proxy' : 'start'
    );

    // const token: string = await Promise.resolve('token-from-backend')

    const { configPath } = await createFileTree(config, cwd);

    cli.log(
      fromOptic(`Added Optic configuration to ${colors.bold(configPath)}`)
    );

    async function startInitFlow() {
      const paths = await getPathsRelativeToConfig();
      const daemonState = await ensureDaemonStarted(
        lockFilePath,
        Config.apiBaseUrl
      );

      const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
      developerDebugLogger(`api base url: ${apiBaseUrl}`);
      const cliClient = new Client(apiBaseUrl);
      const cliSession = await cliClient.findSession(paths.cwd, null, null);
      developerDebugLogger({ cliSession });
      openBrowser(linkToSetup(cliSession.session.id));
    }

    await startInitFlow();

    await trackUserEvent(
      name,
      ApiInitializedInProject.withProps({
        cwd: cwd,
        source:
          Object.entries(flags).length === 0
            ? 'documentation'
            : 'on-boarding-flow',
        apiName: name,
      })
    );
    process.exit(0);
  }
}
