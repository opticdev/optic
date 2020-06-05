import Command from '@oclif/command';
import fs from 'fs-extra';
import {
  developerDebugLogger,
  loadPathsAndConfig,
  fromOptic,
  promiseFromOptic,
  SaasClient,
} from '@useoptic/cli-shared';
import { Config } from '../../config';
import { ITestingConfig } from '@useoptic/cli-config';

export default class Enable extends Command {
  static description = 'Enable Live Contracting Testing for your API';
  static hidden: boolean = Config.hiddenFeatures.includes('testing');

  async run() {
    const loadingConfig = loadPathsAndConfig(this);
    promiseFromOptic(loadingConfig, 'Loading your optic.yml');
    const { paths, config } = await loadingConfig;

    if (fs.existsSync(paths.testingConfigPath)) {
      return this.log(
        fromOptic(
          'Testing is already enabled for this API. To re-enable, use testing:disable command first.'
        )
      );
    }

    const saasClient = new SaasClient(Config.apiBaseUrl);
    developerDebugLogger('fetching auth token');

    const gettingApiToken = saasClient.getApiAuthToken(
      config.name || 'Unknown API'
    );
    promiseFromOptic(gettingApiToken, 'Creating Testing credentials for API');

    const authToken = await gettingApiToken;

    const testingConfig: ITestingConfig = { authToken };
    const savingToken = (async () => {
      await fs.ensureFile(paths.testingConfigPath);
      await fs.writeJson(paths.testingConfigPath, testingConfig);
    })();
    promiseFromOptic(savingToken, 'Saving Testing credentials locally');

    await savingToken;

    this.log(fromOptic('Live Contract Testing has successfully been enabled.'));
  }
}
