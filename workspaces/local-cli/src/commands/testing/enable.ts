import Command from '@oclif/command';
import fs from 'fs-extra';
import {
  developerDebugLogger,
  loadPathsAndConfig,
  fromOptic,
  promiseFromOptic,
  SaasClient,
} from '@useoptic/cli-shared';
import UrlJoin from 'url-join';
import Config from '../../config';

export default class Enable extends Command {
  static description = 'Enable Live Contracting Testing for your API';

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

    const baseUrl = UrlJoin(Config.apiGatewayUrl, 'api/v1');
    const saasClient = new SaasClient(baseUrl);
    developerDebugLogger('fetching auth token');

    const gettingApiToken = saasClient.getApiAuthToken(
      config.name || 'Unknown API'
    );
    promiseFromOptic(gettingApiToken, 'Creating Testing credentials for API');

    const authToken = await gettingApiToken;

    const testingConfig = { authToken };
    const savingToken = (async () => {
      await fs.ensureFile(paths.testingConfigPath);
      await fs.writeFile(
        paths.testingConfigPath,
        Buffer.from(JSON.stringify(testingConfig))
      );
    })();
    promiseFromOptic(savingToken, 'Saving Testing credentials locally');

    await savingToken;

    this.log(fromOptic('Live Contract Testing has successfully been enabled.'));
  }
}
