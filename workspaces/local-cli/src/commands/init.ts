import Command from '@oclif/command';
import { createFileTree } from '@useoptic/cli-config';
import * as colors from 'colors';
import cli from 'cli-ux';
import { fromOptic } from '../shared/conversation';
import * as fs from 'fs-extra';
import * as path from 'path';
import { track, trackAndSpawn } from '../shared/analytics';

export default class Init extends Command {
  static description = 'Add Optic to your API';

  async run() {
    const cwd = process.cwd();

    if (fs.existsSync(path.join(cwd, 'optic.yml'))) {
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

    await trackAndSpawn('New API Created', { name });

    const config = `
name: ${name}
tasks:
  # The default task, invoke using \`api run start\`
  # Learn how to finish setting up Optic at http://docs.useoptic.com/setup
  start:
    command: echo "Setup A Valid Command to Start your API!"
    baseUrl: http://localhost:4000
ignoreRequests:
- OPTIONS *`.trimLeft();

    // const token: string = await Promise.resolve('token-from-backend')

    const { configPath } = await createFileTree(config, cwd);
    cli.log(
      fromOptic(`Added Optic configuration to ${colors.bold(configPath)}`)
    );
    cli.log(
      fromOptic(
        `Open the ${colors.bold(
          'optic.yml'
        )} to finish adding Optic to your API`
      )
    );
    process.exit();
  }
}
