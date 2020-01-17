import Command from '@oclif/command';
import {createFileTree, IApiCliConfig} from '@useoptic/cli-config';
import * as colors from 'colors';
import cli from 'cli-ux';

export default class Init extends Command {
  static description = 'Add Optic to your API';

  async run() {
    const cwd = process.cwd();
    const shouldUseThisDirectory = await cli.confirm(`${colors.bold.blue(cwd)}\nIs this your API's root directory? (yes/no)`);

    if (!shouldUseThisDirectory) {
      this.log(colors.red(`Optic must be initialized in your API's root directory. Navigate there and then run ${colors.bold('api init')} again`));
      process.exit(1);
    }

    const config: IApiCliConfig = {
      name: 'New API',
      tasks: {
        start: {
          command: 'echo "Setup A Valid Command to Start your API!"',
          baseUrl: 'http://localhost:3000'
        }
      }
    };
    await createFileTree(config);
  }

}
