import Command from '@oclif/command';
import slugify from 'slugify';
import * as colors from 'colors';
import {
  loadPathsAndConfig,
  fromOptic,
  warningFromOptic,
  promiseFromOptic,
  errorFromOptic,
} from '@useoptic/cli-shared';
import cli from 'cli-ux';
import * as fs from 'fs-extra';

export default class Disable extends Command {
  static description = 'Disable Live Contracting Testing for your API';

  async run() {
    const loadingConfig = loadPathsAndConfig(this);
    promiseFromOptic(loadingConfig, 'Loading your optic.yml');
    const { paths, config } = await loadingConfig;

    if (!fs.existsSync(paths.testingConfigPath)) {
      return this.log(
        fromOptic('Testing was not enabled for this API. Nothing to disable.')
      );
    }

    this.log(
      warningFromOptic(`WARNING: Destructive action
This command will revoke access from all your testing history. Re-enabling through testing:enable will ${colors.bold(
        'not'
      )} restore access.`)
    );

    const expectedConfirmation = slugify(
      config.name || 'i understand please continue'
    ).toLowerCase();
    const confirm = await cli.prompt(
      fromOptic(`To proceed, type ${colors.bold.red(expectedConfirmation)}`)
    );

    if (confirm !== expectedConfirmation) {
      return this.log(
        errorFromOptic(
          `Confirmation did not match ${colors.bold.red(
            expectedConfirmation
          )}. Aborted.`
        )
      );
    }

    fs.unlinkSync(paths.testingConfigPath);
    this.log(
      fromOptic('Live Contract Testing has successfully been disabled.')
    );
  }
}
