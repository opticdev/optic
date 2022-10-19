import brotli from 'brotli';
import fs from 'node:fs/promises';
import path from 'path';
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
        `OPTIC_TOKEN=your_token_here optic ruleset publish <path_to_ruleset>`,
    })
    .description('Publish a custom ruleset to optic cloud')
    .addHelpText(
      'after',
      `
This command also requires a token to be provided via the environment variable OPTIC_TOKEN. Generate an optic token at https://app.useoptic.com.`
    )
    .argument('<path_to_ruleset>', 'the path to the ruleset to publish')
    .action(wrapActionHandlerWithSentry(getPublishAction()));
};

const getPublishAction = () => async (filePath: string) => {
  const maybeToken = process.env.OPTIC_TOKEN;

  if (!maybeToken) {
    throw new UserError(
      'No optic token was provided (set the environment variable `OPTIC_TOKEN` with your optic token). Generate an optic token at https://app.useoptic.com.'
    );
  }

  const absolutePath = path.join(process.cwd(), filePath);
  const userRuleFile = await import(absolutePath).catch((e) => {
    console.error(e);
    throw new UserError();
  });

  if (!fileIsValid(userRuleFile)) {
    throw new UserError(
      `Rules file does not match expected format. ${expectedFileShape}`
    );
  }

  const name = userRuleFile.default.name;

  const fileBuffer = await fs.readFile(absolutePath);
  const compressed = brotli.compress(fileBuffer);

  const compressedFileBuffer = Buffer.from(compressed);
  const rulesetUpload: {
    id: string;
    upload_url: string;
  } = await (async (name: any, token: string) => ({
    id: '',
    upload_url: 'https://example.com/placeholder',
  }))(name, maybeToken); // TODO connect up to BWTS
  await uploadFileToS3(rulesetUpload.upload_url, compressedFileBuffer);
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
          pattern: '^[a-zA-Z-]+$',
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
