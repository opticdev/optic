import zlib from 'node:zlib';
import fs from 'node:fs/promises';
import path from 'path';
import { Command } from 'commander';
import Ajv from 'ajv';

import { UserError } from '@useoptic/openapi-utilities';

import { OpticCliConfig } from '../../config';
import { uploadFileToS3 } from '../../utils/s3';
import { errorHandler } from '../../error-handler';

const expectedFileShape = `Expected ruleset file to have a default export with the shape
{
  name: string;
  description: string;
  configSchema?: any;
  rulesetConstructor: (config: ConfigSchema) => Ruleset;
}`;

export const registerRulesetUpload = (cli: Command, config: OpticCliConfig) => {
  cli
    .command('upload')
    .configureHelp({
      commandUsage: () =>
        `OPTIC_TOKEN=your_token_here optic ruleset upload <path_to_ruleset>`,
    })
    .description('Upload a custom ruleset to optic cloud')
    .addHelpText(
      'after',
      `
This command also requires a token to be provided via the environment variable OPTIC_TOKEN. Generate an optic token at https://app.useoptic.com.`
    )
    .argument(
      '<path_to_ruleset>',
      'the path to the javascript ruleset file to upload, typically "./build/main.js".'
    )
    .action(errorHandler(getUploadAction(config)));
};

const getUploadAction =
  (config: OpticCliConfig) => async (filePath: string) => {
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
    const ruleset = await config.client.createRuleset(
      name,
      description,
      configSchema
    );
    await uploadFileToS3(ruleset.upload_url, compressedFileBuffer);
    await config.client.patchRuleset(ruleset.id, true);

    console.log('Successfully uploaded the ruleset');
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
    rulesetConstructor: () => any;
  };
} => {
  const result = validateRulesFile(file);

  if (!result) {
    console.error(
      `Rule file is invalid:\n${ajv.errorsText(validateRulesFile.errors)}`
    );
    return false;
  }

  // manually validate that rulesetConstructor is a function
  const rulesetConstructor = (file.default as any)?.rulesetConstructor;
  if (typeof rulesetConstructor !== 'function') {
    console.error(
      'Rules file does not export a rulesetConstructor that is a function'
    );
    return false;
  }

  return true;
};
