import { Command, flags } from '@oclif/command';
import {
  ITestingConfig,
  pathsFromCwd,
  readApiConfig,
} from '@useoptic/cli-config';
import { dirname } from 'path';
import fs from 'fs-extra';
import { SaasClient } from '@useoptic/cli-shared';
import { Config } from '../../config';
import {
  ICreateCaptureRequest,
  ICreateCaptureResponse,
} from '@useoptic/saas-types';

export default class Publish extends Command {
  static description =
    'publishes the local specification to Optic to be publicly viewable';

  static examples = [`$ optic-ci publish`];

  static flags = {
    config: flags.string({
      required: true,
      description: 'the path to your optic.yml file',
      default: './optic.yml',
    }),
    url: flags.boolean({
      default: false,
      description: "only log the url of the specId",
    })
  };

  async run() {
    const { flags } = this.parse(Publish);

    const { config: configPath, url: outputOnlyUrl } = flags;
    // find the .optic/api/specification.json relative to the optic.yml
    const config = await readApiConfig(configPath);
    const basePath = dirname(configPath);
    const paths = pathsFromCwd(basePath);
    const { specStorePath, testingConfigPath } = paths;
    const specFile = await fs.readJson(specStorePath);

    const saasClient = new SaasClient(Config.apiBaseUrl);

    const { uploadUrl, location } = await saasClient.getShareSpecUploadUrl();

    // upload the spec
    const events = await fs.readJson(specStorePath);
    await saasClient.uploadSpec(uploadUrl, events);

    const url = `${Config.specViewerUrl}/public/${location.value}`;
    if (outputOnlyUrl) {
      this.log(url);
    } else {
      this.log(`Check out your spec live @ ${url}`)
    }
  }
}
