import fs from 'node:fs/promises';
import yaml from 'js-yaml';
import { UserError } from '@useoptic/openapi-utilities';
import Ajv from 'ajv';
import path from 'node:path';

const OPTIC_YML_NAME = 'optic.yml';

type ConfigRule = string | { rule: string; options?: unknown };

export type OpticCliConfig = {
  // path to the loaded config, or undefined if it was the default config
  configPath?: string;

  files: {
    path: string;
    id: string;
  }[];

  rules: ConfigRule[];
};

export const DefaultOpticCliConfig = {
  configPath: undefined,
  files: [],
  rules: [],
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
          },
          id: {
            type: 'string',
          },
        },
        required: ['path', 'id'],
      },
    },
    rules: {
      type: 'array',
      items: {
        anyOf: [
          { type: 'string' },
          {
            type: 'object',
            properties: {
              rule: { type: 'string' },
              options: { type: 'object' },
            },
            required: ['rule'],
          },
        ],
      },
    },
  },
};
const validateConfigSchema = ajv.compile(configSchema);

// attempt to find an optic.yml file, or return undefined if none can be found
export async function detectCliConfig(
  dir: string
): Promise<string | undefined> {
  const expectedYmlPath = path.join(dir, OPTIC_YML_NAME);
  try {
    await fs.access(expectedYmlPath);
  } catch (e) {
    return undefined;
  }

  return expectedYmlPath;
}

export async function loadCliConfig(path: string): Promise<OpticCliConfig> {
  const config = yaml.load(await fs.readFile(path, 'utf-8'));

  validateConfig(config, path);

  const cliConfig = config as OpticCliConfig;
  cliConfig.configPath = path;

  return cliConfig;
}

export const validateConfig = (config: unknown, path: string) => {
  const result = validateConfigSchema(config);

  if (!result) {
    throw new UserError(
      `Configuration file \`${path}\` is invalid:\n${validateConfigSchema.errors
        ?.map((e) => `\t${e.message}`)
        .join('\n')}`
    );
  }
};
