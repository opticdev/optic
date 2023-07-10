import fs from 'node:fs/promises';
import yaml from 'js-yaml';
import { UserError } from '@useoptic/openapi-utilities';
import Ajv from 'ajv';
import os from 'os';
import path from 'node:path';
import { createOpticClient, OpticBackendClient } from './client';
import * as Git from './utils/git-utils';
import { logger } from './logger';
import { Static, Type } from '@sinclair/typebox';

export enum VCS {
  Git = 'git',
  Cloud = 'cloud', // hosted in optic cloud
}

export const OPTIC_YML_NAME = 'optic.yml';
export const OPTIC_DEV_YML_NAME = 'optic.dev.yml';
export const USER_CONFIG_DIR = path.join(os.homedir(), '.config', 'optic');

export const USER_CONFIG_PATH =
  process.env.OPTIC_ENV === 'staging'
    ? path.join(USER_CONFIG_DIR, 'config.staging.json')
    : process.env.OPTIC_ENV === 'local'
    ? path.join(USER_CONFIG_DIR, 'config.local.json')
    : path.join(USER_CONFIG_DIR, 'config.json');

const DefaultOpticCliConfig: OpticCliConfig = {
  root: process.cwd(),
  configPath: undefined,
  ruleset: undefined,
  isAuthenticated: false,
  client: createOpticClient('no_token'),
  isInCi: process.env.CI === 'true',
};

const CaptureConfigData = Type.Object({
  config: Type.Optional(
    Type.Object({
      request_concurrency: Type.Optional(Type.Number()),
    })
  ),
  server: Type.Object({
    dir: Type.Optional(Type.String()),
    command: Type.Optional(Type.String()),
    url: Type.String(),
    ready_endpoint: Type.Optional(Type.String()),
    ready_interval: Type.Optional(Type.Number()),
  }),
  requests: Type.Array(
    Type.Object({
      path: Type.String(),
      verb: Type.Optional(
        Type.String({
          enum: ['GET', 'POST', 'PATCH', 'DELETE'],
        })
      ),
      data: Type.Optional(Type.Object({})),
    })
  ),
});
export type CaptureConfigData = Static<typeof CaptureConfigData>;
export type ServerConfig = CaptureConfigData['server'];
export type Request = CaptureConfigData['requests'][number];

export const ProjectYmlConfig = Type.Object({
  extends: Type.Optional(Type.String()),
  ruleset: Type.Optional(
    Type.Array(
      Type.Union([
        Type.String(),
        Type.Object(
          {},
          {
            minProperties: 1,
            maxProperties: 1,
          }
        ),
      ])
    )
  ),
  capture: Type.Optional(Type.Record(Type.String(), CaptureConfigData)),
});
export type ProjectYmlConfig = Static<typeof ProjectYmlConfig>;
export type ConfigRuleset = { name: string; config: unknown };

export type OpticCliConfig = Omit<ProjectYmlConfig, 'ruleset'> & {
  ruleset?: ConfigRuleset[];

  // path to the loaded config, or undefined if it was the default config
  configPath?: string;

  // undefined if git repo root was detected, otherwise the path to the git repo root
  root: string;

  // the detected vcs
  vcs?: {
    type: VCS;
    sha: string;
    // Set of absolute paths
    diffSet: Set<string>;
  };

  isAuthenticated: boolean;
  authenticationType?: 'user' | 'env';
  client: OpticBackendClient;

  isInCi: boolean;
};

const ajv = new Ajv();
const validateConfigSchema = ajv.compile(ProjectYmlConfig);

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

  return expectedYmlPath;
}

export async function loadCliConfig(
  configPath: string,
  client: OpticBackendClient
): Promise<OpticCliConfig> {
  const config = yaml.load(await fs.readFile(configPath, 'utf-8'));
  validateConfig(config, configPath);
  await initializeRules(config as ProjectYmlConfig, client);

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
  config: ProjectYmlConfig,
  client: OpticBackendClient
) => {
  let rulesetMap: Map<string, ConfigRuleset> = new Map();
  if (config.extends) {
    console.log(`Extending ruleset from ${config.extends}`);

    try {
      const response = await client.getStandard(config.extends);
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

  if (config.ruleset) {
    for (const ruleset of config.ruleset) {
      if (typeof ruleset === 'string') {
        rulesetMap.set(ruleset, { name: ruleset, config: {} });
      } else if (typeof ruleset === 'object' && ruleset !== null) {
        const keys = Object.keys(ruleset);
        if (keys.length !== 1) {
          throw new UserError(
            `Configuration error: empty ruleset configuration`
          );
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
  }
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

async function getYmlOrJsonChanges(gitRoot: string): Promise<Set<string>> {
  const status = await Git.gitStatus();
  const ymlOrJsonWithChanges = status
    .split('\n')
    .filter((line) => /\.(json|ya?ml)$/i.test(line))
    .map((line) => {
      const file = line.split(' ').slice(-1)[0].trim();
      return path.join(gitRoot, file);
    });

  return new Set(ymlOrJsonWithChanges);
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

  if ((await Git.hasGit()) && (await Git.isInGitRepo())) {
    const gitRoot = await Git.getRootPath();
    const opticYmlPath = await detectCliConfig(gitRoot);

    if (opticYmlPath) {
      logger.debug(`Using config found at ${opticYmlPath}`);
      cliConfig = {
        ...cliConfig,
        ...(await loadCliConfig(opticYmlPath, cliConfig.client)),
      };
    } else {
      cliConfig.root = gitRoot;
    }

    try {
      cliConfig.vcs = {
        type: VCS.Git,
        sha: await Git.resolveGitRef('HEAD'),
        diffSet: await getYmlOrJsonChanges(gitRoot),
      };
    } catch (e) {
      // Git command can fail in a repo with no commits, we should treat this as having no commits
    }
  }

  logger.debug(cliConfig);

  return cliConfig;
}
