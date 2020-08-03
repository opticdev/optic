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
  static description = 'publishes the local specification to Optic to be publicly viewable';

  static examples = [`$ optic-ci publish`];

  static flags = {
    config: flags.string({
      required: true,
      description: 'the path to your optic.yml file',
      default: '.'
    }),
  };

  async run() {
    const { flags } = this.parse(Publish);

    const {
      config: configPath,
    } = flags;

    // find the .optic/api/specification.json relative to the optic.yml
    const config = await readApiConfig(configPath);
    const basePath = dirname(configPath);
    const paths = pathsFromCwd(basePath);
    const { specStorePath, testingConfigPath } = paths;
    const specFile = await fs.readJson(specStorePath);

    // TODO: Upload Spec
    
    // // find the api jwt
    // const testingConfigExists = await fs.pathExists(testingConfigPath);
    // if (!testingConfigExists) {
    //   return this.error(
    //     `No testing token found at ${testingConfigPath} \nPlease run 'api testing:enable'`
    //   );
    // }
    // const { authToken }: ITestingConfig = await fs.readJson(testingConfigPath);

    // // use the api jwt to get an upload url for the spec
    // const saasClient = new SaasClient(Config.apiBaseUrl, authToken);
    // const { uploadUrl, location } = await saasClient.getSpecUploadUrl();

    // // upload the spec
    // await saasClient.uploadSpec(uploadUrl, specFile);

    // // use flags.config to resolve the optic.yml. extract the ignoreRequests from it

    // // use the api jwt and the spec url and the flags, etc. to create a capture

    // const captureInfo: ICreateCaptureRequest = {
    //   specLocation: location,
    //   opticConfig: {
    //     ignoreRequests: config.ignoreRequests,
    //   },
    //   captureMetadata: {
    //     deploymentId,
    //     buildId,
    //     environmentName,
    //     apiName: config.name || null,
    //   },
    // };

    // const response: ICreateCaptureResponse = await saasClient.startCapture(
    //   captureInfo
    // );
    // // output the capture jwt to standard out so the caller can pass it along to each agent-cli
    // this.log(JSON.stringify(response));
  }
}
