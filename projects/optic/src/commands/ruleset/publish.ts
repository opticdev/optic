import zlib from 'node:zlib';
import fs from 'node:fs/promises';
import path from 'path';
import { Command } from 'commander';
import Ajv from 'ajv';

import { wrapActionHandlerWithSentry } from '@useoptic/openapi-utilities/build/utilities/sentry';
import { UserError } from '@useoptic/openapi-utilities';

import { OpticCliConfig } from '../../config';
import { createOpticClient } from '@useoptic/optic-ci/build/cli/clients/optic-client';
import { uploadFileToS3 } from './s3';

const expectedFileShape = `Expected ruleset file to have a default export with the shape
{
  name: string;
  description: string;
  configSchema?: any;
  rulesConstructor: (config: ConfigSchema) => Ruleset;
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
  const configSchema = userRuleFile.default.configSchema ?? {};
  const description = userRuleFile.default.description;

  const fileBuffer = await fs.readFile(absolutePath);
  const compressed = zlib.brotliCompressSync(fileBuffer);

  const compressedFileBuffer = Buffer.from(compressed);
  const opticClient = createOpticClient(maybeToken);
  const ruleset = await opticClient.createRuleset(name, description, configSchema);
  await uploadFileToS3(ruleset.upload_url, compressedFileBuffer);
  await opticClient.patchRuleset(ruleset.id, true);

  console.log('Successfully published the ruleset');
  console.log(`View this ruleset at ${ruleset.ruleset_url}`);
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    default: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          pattern: '^[a-zA-Z-]+$',
        },
        description: {
          type: 'string',
          maxLength: 1024,
        },
        configSchema: {
          type: 'object',
        },
      },
      required: ['description', 'name'],
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
    description: string;
    configSchema?: any;
    rulesConstructor: () => any;
  };
} => {
  const result = validateRulesFile(file);

  if (!result) {
    console.error(
      `Rule file is invalid:\n${ajv.errorsText(validateRulesFile.errors)}`
    );
    return false;
  }

  // manually validate that rulesConstructor is a function
  const rulesConstructor = (file.default as any)?.rulesConstructor;
  if (typeof rulesConstructor !== 'function') {
    console.error(
      'Rules file does not export a rulesConstructor that is a function'
    );
    return false;
  }

  return true;
};
