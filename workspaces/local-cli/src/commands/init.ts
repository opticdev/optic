import { Command, flags } from '@oclif/command';
import { createFileTree } from '@useoptic/cli-config';
import colors from 'colors';
import cli from 'cli-ux';
import fs from 'fs-extra';
import path from 'path';
import { fromOptic } from '@useoptic/cli-shared';
import { opticTaskToProps, trackUserEvent } from '../shared/analytics';
import {
  ApiCheckCompleted,
  ApiCreated,
  ApiInitializedInProject,
} from '@useoptic/analytics/lib/events/onboarding';

export default class Init extends Command {
  static description = 'Add Optic to your API';

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
          `This directory already has an ${colors.bold('optic.yml')} file.`
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

    const config = `
name: ${name}
tasks:
  # The default task, invoke using \`api run start\`
  # Learn how to set up and use Optic at https://app.useoptic.com
  start:
    command: ${
      flags.command || 'echo "Setup A Valid Command to Start your API!"'
    }
    inboundUrl: ${flags.inboundUrl || 'http://localhost:4000'}
ignoreRequests:
# For more information on configuration, visit https://www.useoptic.com/docs/faqs-and-troubleshooting/captures
- OPTIONS (.*)`.trimLeft();

    // const token: string = await Promise.resolve('token-from-backend')

    const { configPath } = await createFileTree(config, cwd);

    cli.log(
      fromOptic(`Added Optic configuration to ${colors.bold(configPath)}`)
    );
    if (!flags.command)
      cli.log(
        fromOptic(
          `Open the ${colors.bold(
            'optic.yml'
          )} to finish adding Optic to your API`
        )
      );
    // process.exit();

    await trackUserEvent(
      ApiInitializedInProject.withProps({
        cwd: cwd,
        apiName: name,
      })
    );
  }
}

function buildInitialTask(flags: any) {
  //default config and valid for start injected
  let commandConfig = `
  start:
     command: ${
       flags.command || 'echo "Setup A Valid Command to Start your API!"'
     }
     inboundUrl: ${flags.inboundUrl || 'http://localhost:4000'}
`.trimRight();

  if (flags.inboundUrl && flags.targetUrl) {
    commandConfig = `
  start-proxy:
     inboundUrl: ${flags.inboundUrl}
     targetUrl: ${flags.targetUrl}
`.trimRight();
  }

  return commandConfig;
}
