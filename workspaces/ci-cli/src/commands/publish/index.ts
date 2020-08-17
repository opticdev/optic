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
import { S3 } from 'aws-sdk';

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
  };

  async run() {
    const { flags } = this.parse(Publish);

    const { config: configPath } = flags;
    // find the .optic/api/specification.json relative to the optic.yml
    const config = await readApiConfig(configPath);
    const basePath = dirname(configPath);
    const paths = pathsFromCwd(basePath);
    const { specStorePath, testingConfigPath } = paths;
    const specFile = await fs.readJson(specStorePath);

    const { authToken }: ITestingConfig = await fs.readJson(testingConfigPath);

    const saasClient = new SaasClient("http://localhost:4000/api/v1", authToken);
    console.log(saasClient)
    const { uploadUrl, location } = await saasClient.getShareSpecUploadUrl();
    console.log(uploadUrl)
    // upload the spec
    const events = await fs.readJson(specStorePath);
    await saasClient.uploadSpec(uploadUrl, events);

    // // TODO: Upload Spec
    // const client = new S3({
    //   accessKeyId: process.env.ACCESS_KEY_ID,
    //   secretAccessKey: process.env.SECRET_ACCESS_KEY,
    // });
    // try {
    //   const result = await this.putObject(client, specFile);
    //   console.log(result);
    // } catch (err) {
    //   console.error(err);
    // }
    

    /*
    // find the api jwt
    const testingConfigExists = await fs.pathExists(testingConfigPath);
    if (!testingConfigExists) {
      return this.error(
        `No testing token found at ${testingConfigPath} \nPlease run 'api testing:enable'`
      );
    }
    const { authToken }: ITestingConfig = await fs.readJson(testingConfigPath);

    // use the api jwt to get an upload url for the spec
    const saasClient = new SaasClient(Config.apiBaseUrl, authToken);
    const { uploadUrl, location } = await saasClient.getSpecUploadUrl();

    // upload the spec
    await saasClient.uploadSpec(uploadUrl, specFile);

    // use flags.config to resolve the optic.yml. extract the ignoreRequests from it

    // use the api jwt and the spec url and the flags, etc. to create a capture

    const captureInfo: ICreateCaptureRequest = {
      specLocation: location,
      opticConfig: {
        ignoreRequests: config.ignoreRequests,
      },
      captureMetadata: {
        deploymentId,
        buildId,
        environmentName,
        apiName: config.name || null,
      },
    };

    const response: ICreateCaptureResponse = await saasClient.startCapture(
      captureInfo
    );
    // output the capture jwt to standard out so the caller can pass it along to each agent-cli
    this.log(JSON.stringify(response));
    */
  }

  async putObject(client:S3, specFile: any) {
    return new Promise((resolve, reject) => {
      client.putObject(
        {
          Bucket: 'bucket',
          Key: 'uuid_somewhere',
          Body: JSON.stringify(specFile),
          ContentType: 'application/json; charset=utf-8',
          ACL: 'public-read',
          CacheControl: 'max-age=60',
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    })
  }
}
