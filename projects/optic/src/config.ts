import fs from 'node:fs/promises';
import fetch from 'node-fetch';
import yaml from 'js-yaml';
import { UserError, isTruthyStringValue } from '@useoptic/openapi-utilities';
import Ajv from 'ajv';
import os from 'os';
import path from 'node:path';
import { createOpticClient, OpticBackendClient } from './client';
import * as Git from './utils/git-utils';
import { logger } from './logger';
import { Static, Type } from '@sinclair/typebox';
import Handlebars from 'handlebars';
import * as dotenv from 'dotenv';
import { anonymizeOrgToken, anonymizeUserToken } from './client/optic-backend';

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

const checkIsInCi = (): boolean => {
  return process.env.CI !== undefined && isTruthyStringValue(process.env.CI);
};

const DefaultOpticCliConfig: OpticCliConfig = {
  isDefaultConfig: true,
  root: process.cwd(),
  configPath: undefined,
  ruleset: undefined,
  isAuthenticated: false,
  client: createOpticClient('no_token'),
  isInCi: checkIsInCi(),
};

const RequestSend = Type.Object({
  path: Type.String(),
  method: Type.Optional(
    Type.String({
      enum: ['GET', 'POST', 'PATCH', 'DELETE'],
    })
  ),
  data: Type.Optional(Type.Object({})),
  headers: Type.Optional(Type.Record(Type.String(), Type.String())),
});

const RequestRun = Type.Optional(
  Type.Object({
    command: Type.String(),
    proxy_variable: Type.Optional(Type.String()),
  })
);

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
    ready_timeout: Type.Optional(Type.Number()),
  }),
  requests: Type.Object({
    // one of these is technically required, but that's enforced at runtime
    run: Type.Optional(RequestRun),
    send: Type.Optional(Type.Array(RequestSend)),
  }),
});

export type CaptureConfigData = Static<typeof CaptureConfigData>;
export type ServerConfig = CaptureConfigData['server'];
export type RequestSend = Static<typeof RequestSend>;
export type RequestRun = Static<typeof RequestRun>;
export type CaptureConfigConfig = CaptureConfigData['config'];

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
  external_refs: Type.Optional(
    Type.Object({
      resolve_headers: Type.Optional(
        Type.Array(
          Type.Object({
            headers: Type.Record(Type.String(), Type.String()),
            url_prefix: Type.Optional(Type.String()),
          })
        )
      ),
    })
  ),
});
export type ProjectYmlConfig = Static<typeof ProjectYmlConfig>;
export type ConfigRuleset = { name: string; config: unknown };

export type OpticCliConfig = Omit<ProjectYmlConfig, 'ruleset'> & {
  isDefaultConfig: boolean;

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
  userId?: string;
  client: OpticBackendClient;

  isInCi: boolean;
};

const ajv = new Ajv();
const validateConfigSchema = ajv.compile(ProjectYmlConfig);

// attempt to find an optic.yml file, or return undefined if none can be found
// Starts from cwd, and looks up until the top level dir (usually the git root or cwd)
export async function detectCliConfig(
  topLevelDir: string
): Promise<string | undefined> {
  let currentDir = process.cwd();
  // search up from pwd to specified dir
  while (topLevelDir.length <= currentDir.length) {
    const expectedDevYmlPath = path.join(currentDir, OPTIC_DEV_YML_NAME);
    const expectedYmlPath = path.join(currentDir, OPTIC_YML_NAME);
    try {
      await fs.access(expectedYmlPath);
      return expectedYmlPath;
    } catch (e) {}

    try {
      await fs.access(expectedDevYmlPath);
      return expectedDevYmlPath;
    } catch (e) {}

    const next = path.dirname(currentDir);
    if (currentDir === next) break;
    currentDir = next;
  }

  return undefined;
}

export async function RenderTemplate(configPath: string): Promise<unknown> {
  const template = Handlebars.compile(await fs.readFile(configPath, 'utf-8'));
  const result = template(process.env);
  return yaml.load(result);
}

export async function loadCliConfig(
  configPath: string,
  client: OpticBackendClient
): Promise<OpticCliConfig> {
  const config = await RenderTemplate(configPath);

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
    throw new UserError({
      message: `Configuration file \`${path}\` is invalid:\n${ajv.errorsText(
        validateConfigSchema.errors
      )}`,
    });
  }
};

export const initializeRules = async (
  config: ProjectYmlConfig,
  client: OpticBackendClient
) => {
  let rulesetMap: Map<string, ConfigRuleset> = new Map();
  let rawRulesets = config.ruleset ? config.ruleset : [];
  if (config.extends) {
    logger.debug(`Extending ruleset from ${config.extends}`);

    try {
      if (config.extends.startsWith('@')) {
        logger.error('Cloud rulesets are not supported');
      } else {
        // Assumption is that we're fetching a yaml file
        const response = await fetch(config.extends).then((response) => {
          if (response.status !== 200) {
            throw new Error(`received status code ${response.status}`);
          } else {
            return response.text();
          }
        });
        const parsed = yaml.load(response);
        rawRulesets.push(...(parsed as any).ruleset);
      }
    } catch (e) {
      console.error(e);
      console.log(
        `Failed to download the ruleset from ${config.extends}. Not using extended ruleset`
      );
    }
  }

  if (rawRulesets.length) {
    for (const ruleset of rawRulesets) {
      if (typeof ruleset === 'string') {
        rulesetMap.set(ruleset, { name: ruleset, config: {} });
      } else if (typeof ruleset === 'object' && ruleset !== null) {
        const keys = Object.keys(ruleset);
        if (keys.length !== 1) {
          throw new UserError({
            message: `Configuration error: empty ruleset configuration`,
          });
        } else {
          const name = keys[0];
          const config = ruleset[name] || {};
          rulesetMap.set(name, { name, config });
        }
      } else {
        throw new UserError({
          message: 'Configuration error: unexpected ruleset format',
        });
      }
    }

    config.ruleset = [...rulesetMap.values()];
  }
};

export type UserConfig = {
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
    cliConfig.userId = token.startsWith('opat')
      ? anonymizeUserToken(token)
      : anonymizeOrgToken(token);
    cliConfig.client = createOpticClient(token);
  }

  if ((await Git.hasGit()) && (await Git.isInGitRepo())) {
    const gitRoot = await Git.getRootPath();
    const opticYmlPath = await detectCliConfig(gitRoot);

    if (opticYmlPath) {
      logger.debug(`Using config found at ${opticYmlPath}`);
      // if present, expect the .optic.env is in the same dir as the config file
      dotenv.config({
        path: path.join(path.dirname(opticYmlPath), '.optic.env'),
      });
      cliConfig = {
        ...cliConfig,
        ...(await loadCliConfig(opticYmlPath, cliConfig.client)),
        isDefaultConfig: false,
      };
    } else {
      // if present, expect the .optic.env in the current working dir
      dotenv.config({ path: path.join(process.cwd(), '.optic.env') });
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
  } else {
    // if present, expect the .optic.env in the current working dir
    const currentDir = process.cwd();
    dotenv.config({ path: path.join(currentDir, '.optic.env') });
    const opticYmlPath = await detectCliConfig(currentDir);

    if (opticYmlPath) {
      logger.debug(`Using config found at ${opticYmlPath}`);
      cliConfig = {
        ...cliConfig,
        ...(await loadCliConfig(opticYmlPath, cliConfig.client)),
        isDefaultConfig: false,
      };
    }
  }

  logger.debug(cliConfig);

  return cliConfig;
}
