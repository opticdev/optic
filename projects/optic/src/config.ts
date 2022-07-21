import fs from 'node:fs/promises';
import yaml from 'js-yaml';
import { UserError } from '@useoptic/openapi-utilities';
import Ajv from 'ajv';
import path from 'node:path';

export enum VCS {
  Git = 'git',
}

const OPTIC_YML_NAME = 'optic.yml';

type ConfigRuleset = string | { rule: string; options?: unknown };

export type OpticCliConfig = {
  // path to the loaded config, or undefined if it was the default config
  configPath?: string;

  // undefined if git repo root was detected, otherwise the path to the git repo root
  root: string;

  // the detected vcs
  vcs?: string;

  files: {
    path: string;
    id: string;
  }[];

  rulesets: ConfigRuleset[];
};

export const DefaultOpticCliConfig = {
  root: process.cwd(),
  configPath: undefined,
  files: [],
  rulesets: ['breaking-changes'],
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
    rulesets: {
      type: 'array',
      items: {
        anyOf: [
          { type: 'string' },
          {
            type: 'object',
            minProperties: 1,
            maxProperties: 1,
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

export async function loadCliConfig(
  configPath: string
): Promise<OpticCliConfig> {
  const config = yaml.load(await fs.readFile(configPath, 'utf-8'));

  validateConfig(config, configPath);

  const cliConfig = config as OpticCliConfig;
  cliConfig.root = path.dirname(configPath);
  cliConfig.configPath = configPath;

  return cliConfig;
}

export const validateConfig = (config: unknown, path: string) => {
  const result = validateConfigSchema(config);

  if (!result) {
    throw new UserError(
      `Configuration file \`${path}\` is invalid:\n${ajv.errorsText(
        validateConfigSchema.errors
      )}`
    );
  }
};
