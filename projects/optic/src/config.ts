import fs from 'node:fs/promises';
import yaml from 'js-yaml';
import { UserError } from '@useoptic/openapi-utilities';
import Ajv from 'ajv';
import os from 'os';
import path from 'node:path';
import {
  createOpticClient,
  OpticBackendClient,
} from '@useoptic/optic-ci/build/cli/clients/optic-client';
import {
  hasGit,
  isInGitRepo,
  getRootPath,
  isGitStatusClean,
  resolveGitRef,
} from './utils/git-utils';

export enum VCS {
  Git = 'git',
}

export const OPTIC_YML_NAME = 'optic.yml';
export const OPTIC_DEV_YML_NAME = 'optic.dev.yml';
export const USER_CONFIG_PATH = path.join(
  os.homedir(),
  '.config',
  'optic',
  'config.json'
);

type ConfigRuleset = { name: string; config: unknown };

export type RawYmlConfig = {
  ruleset?: unknown[];
  extends?: string;
};

export type OpticCliConfig = Omit<RawYmlConfig, 'ruleset' | 'extends'> & {
  // path to the loaded config, or undefined if it was the default config
  configPath?: string;

  // undefined if git repo root was detected, otherwise the path to the git repo root
  root: string;

  // the detected vcs
  vcs?: {
    type: VCS;
    sha: string;
    status: 'clean' | 'dirty';
  };

  ruleset: ConfigRuleset[];
  isAuthenticated: boolean;
  authenticationType?: 'user' | 'env';
  client: OpticBackendClient;
};

const DefaultOpticCliConfig: OpticCliConfig = {
  root: process.cwd(),
  configPath: undefined,
  ruleset: [{ name: 'breaking-changes', config: {} }],
  isAuthenticated: false,
  client: createOpticClient('no_token'),
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    extends: {
      type: 'string',
    },
    ruleset: {
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
  const expectedDevYmlPath = path.join(dir, OPTIC_DEV_YML_NAME);
  const expectedYmlPath = path.join(dir, OPTIC_YML_NAME);
  // test out the dev path first
  try {
    await fs.access(expectedDevYmlPath);
    return expectedDevYmlPath;
  } catch (e) {}

  try {
    await fs.access(expectedYmlPath);
  } catch (e) {
    return undefined;
  }

  console.warn(
    'Deprecation warning: optic.yml file is deprecated. Please rename your file to optic.dev.yml'
  );
  return expectedYmlPath;
}

export async function loadCliConfig(
  configPath: string,
  client: OpticBackendClient
): Promise<OpticCliConfig> {
  const config = yaml.load(await fs.readFile(configPath, 'utf-8'));
  validateConfig(config, configPath);
  const rawConfig = config as RawYmlConfig;
  await initializeRules(rawConfig, client);

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

export const initializeRules = async (
  config: RawYmlConfig,
  client: OpticBackendClient
) => {
  let rulesetMap: Map<string, ConfigRuleset> = new Map();
  if (config.extends) {
    console.log(`Extending ruleset from ${config.extends}`);

    try {
      const response = await client.getRuleConfig(config.extends);
      rulesetMap = new Map(
        response.config.ruleset.map((conf) => [conf.name, conf])
      );
    } catch (e) {
      console.error(e);
      console.log(
        `Failed to download the ruleset from ${config.extends}. Not using extended ruleset`
      );
    }
  }

  const rulesets = config.ruleset || [];
  for (const ruleset of rulesets) {
    if (typeof ruleset === 'string') {
      rulesetMap.set(ruleset, { name: ruleset, config: {} });
    } else if (typeof ruleset === 'object' && ruleset !== null) {
      const keys = Object.keys(ruleset);
      if (keys.length !== 1) {
        throw new UserError(`Configuration error: empty ruleset configuration`);
      } else {
        const name = keys[0];
        const config = ruleset[name] || {};
        rulesetMap.set(name, { name, config });
      }
    } else {
      throw new UserError('Configuration error: unexpected ruleset format');
    }
  }

  config.ruleset = [...rulesetMap.values()];
};

type UserConfig = {
  token: string;
};

export async function readUserConfig(): Promise<UserConfig | null> {
  try {
    const validator = ajv.compile({
      type: 'object',
      properties: {
        token: {
          type: 'string',
        },
      },
      required: ['token'],
    });
    const unvalidatedConfig = JSON.parse(
      await fs.readFile(USER_CONFIG_PATH, 'utf-8')
    );
    const result = validator(unvalidatedConfig);
    if (!result) {
      return null;
    }

    return unvalidatedConfig as UserConfig;
  } catch (e) {
    return null;
  }
}

export async function initializeConfig(): Promise<OpticCliConfig> {
  let cliConfig: OpticCliConfig = DefaultOpticCliConfig;
  const userConfig = await readUserConfig();
  const maybeEnvToken = process.env.OPTIC_TOKEN;
  const maybeUserToken = userConfig?.token
    ? Buffer.from(userConfig.token, 'base64').toString()
    : null;
  const token = maybeEnvToken || maybeUserToken;
  if (token) {
    cliConfig.authenticationType = maybeEnvToken
      ? 'env'
      : maybeUserToken
      ? 'user'
      : undefined;
    cliConfig.isAuthenticated = true;
    cliConfig.client = createOpticClient(token);
  }

  if ((await hasGit()) && (await isInGitRepo())) {
    const gitRoot = await getRootPath();
    const opticYmlPath = await detectCliConfig(gitRoot);

    if (opticYmlPath) {
      cliConfig = {
        ...cliConfig,
        ...(await loadCliConfig(opticYmlPath, cliConfig.client)),
      };
    }

    try {
      cliConfig.vcs = {
        type: VCS.Git,
        sha: await resolveGitRef('HEAD'),
        status: (await isGitStatusClean()) ? 'clean' : 'dirty',
      };
    } catch (e) {
      // Git command can fail in a repo with no commits, we should treat this as having no commits
    }
  }

  return cliConfig;
}
