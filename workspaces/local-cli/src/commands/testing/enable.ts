import Command from '@oclif/command';
import colors from 'colors';
import fs from 'fs-extra';
import {
  developerDebugLogger,
  loadPathsAndConfig,
  fromOptic,
  SaasClient,
} from '@useoptic/cli-shared';
import { cli } from 'cli-ux';
import UrlJoin from 'url-join';
import Config from '../../config';

export default class Enable extends Command {
  static description = 'Enable Live Contracting Testing for your API';

  async run() {
    const { paths, config } = await loadPathsAndConfig(this);

    if (fs.existsSync(paths.testingConfigPath)) {
      this.log(
        fromOptic(
          'Testing is already enabled for this API. To re-enable, use testing:disable command first.'
        )
      );
    }

    const baseUrl = UrlJoin(Config.apiGatewayUrl, 'api/v1');
    const saasClient = new SaasClient(baseUrl);
    // TODO: render progress indicator and deal with failure
    developerDebugLogger('fetching auth token');
    const authToken = await saasClient.getApiAuthToken(
      config.name || 'Unknown API'
    );

    const testingConfig = { authToken };
    // TODO: render progress indicator and deal with failure
    await fs.ensureFile(paths.testingConfigPath);
    await fs.writeFile(
      paths.testingConfigPath,
      Buffer.from(JSON.stringify(testingConfig))
    );

    this.log(fromOptic('Live Contract Testing has successfully been enabled.'));
  }
}
