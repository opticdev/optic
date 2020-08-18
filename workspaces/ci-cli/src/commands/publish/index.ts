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

    const saasClient = new SaasClient(Config.apiBaseUrl);

    const { uploadUrl, location } = await saasClient.getShareSpecUploadUrl();

    // upload the spec
    const events = await fs.readJson(specStorePath);
    await saasClient.uploadSpec(uploadUrl, events);
    const specViewer = "http://localhost:3000"
    const specId = uploadUrl.split("?")[0].split("/").pop();
    console.log(`Check out your spec live @ ${specViewer}/public/${specId}`)
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
