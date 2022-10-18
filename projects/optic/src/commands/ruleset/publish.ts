import fs from 'node:fs/promises';
import { Command } from 'commander';
import fetch from 'node-fetch';
import Ajv from 'ajv';

import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { UserError } from '@useoptic/openapi-utilities';

import { OpticCliConfig } from '../../config';

const uploadFileToS3 = async (signedUrl: string, file: Buffer) => {
  await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'x-amz-server-side-encryption': 'AES256',
    },
    body: file,
  });
};

const expectedFileShape = `Expected ruleset file to have a default export with the shape
{
  name: string;
  rules: (Ruleset | Rule)[]
}`;

export const registerRulesetPublish = (
  cli: Command,
  config: OpticCliConfig
) => {
  cli
    .command('publish', {
      hidden: true, // TODO unhide this
    })
    .configureHelp({
      commandUsage: () =>
        `optic ruleset publish <path_to_ruleset> --token <token>`,
    })
    .description('Publish a custom ruleset to optic cloud')
    .argument('<path_to_ruleset>', 'the path to the ruleset to publish')
    .requiredOption(
      '--token <token>',
      'the optic token used to authenticate uploading a ruleset. generate an optic token at https://app.useoptic.com'
    )
    .action(wrapActionHandlerWithSentry(getPublishAction()));
};

const getPublishAction =
  () =>
  async ({ path, token }: { path: string; token: string }) => {
    const userRuleFile = await import(path).catch((e) => {
      console.error(e);
      throw new UserError();
    });

    if (!fileIsValid(userRuleFile)) {
      throw new UserError(
        `Rules file does not match expected format. ${expectedFileShape}`
      );
    }

    const name = userRuleFile.default.name;

    const fileBuffer = await fs.readFile(path);
    const rulesetUpload: {
      id: string;
      uploadUrl: string;
    } = await (async (name: any, token: string) => ({ id: '', uploadUrl: '' }))(
      name,
      token
    ); // TODO connect up to BWTS
    await uploadFileToS3(rulesetUpload.uploadUrl, fileBuffer);
    await (async (id: string) => {})(rulesetUpload.id); // TODO connect up to BWTS

    console.log('Successfully published the ruleset');
  };

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    default: {
      type: 'object',
      properties: {
        rules: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        name: {
          type: 'string',
        },
      },
      required: ['rules', 'name'],
    },
  },
  required: ['default'],
};
const validateRulesFile = ajv.compile(configSchema);

const fileIsValid = (
  file: any
): file is {
  default: {
    name: string;
    rules: any[];
  };
} => {
  const result = validateRulesFile(file);

  if (!result) {
    console.error(
      `Rule file is invalid:\n${ajv.errorsText(validateRulesFile.errors)}`
    );
    return false;
  }

  return true;
};
