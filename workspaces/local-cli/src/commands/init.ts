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
  ApiInitializedInProject,
} from '@useoptic/analytics/lib/events/onboarding';

export default class Init extends Command {
  static description = 'Add Optic to your API';

  static flags = {
    inboundUrl: flags.string({}),
    command: flags.string({}),
  };

  async run() {
    const cwd = process.cwd();

    const { flags } = this.parse(Init);

    if (
      fs.existsSync(path.join(cwd, 'optic.yml')) &&
      !(flags.inboundUrl && flags.command)
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

    //bring me back with an ID please
    // await trackAndSpawn('New API Created', { name });

    const config = `
name: ${name}
tasks:
  # The default task, invoke using \`api run start\`
  # Learn how to finish setting up Optic at https://docs.useoptic.com/setup
  start:
    command: ${
      flags.command || 'echo "Setup A Valid Command to Start your API!"'
    }
    inboundUrl: ${flags.inboundUrl || 'http://localhost:4000'}
ignoreRequests:
# For more information on configuration, visit https://docs.useoptic.com/captures
- OPTIONS (.*)`.trimLeft();

    // const token: string = await Promise.resolve('token-from-backend')

    const { configPath } = await createFileTree(config, cwd);

    trackUserEvent(
      ApiInitializedInProject.withProps({
        cwd: cwd,
        apiName: name,
      })
    );

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
  }
}
