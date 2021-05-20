import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import yaml from 'js-yaml';
import getPort from 'get-port';
import findUp from 'find-up';
import {
  parseRule,
  parseIgnore,
  IIgnoreRunnable,
} from './helpers/ignore-parser';

import Deprecations, { warnDeprecation } from './deprecations';
import { defaultIgnoreFile } from './helpers/default-ignore-rules';
export { deprecationLogger } from './deprecations';

export interface IUserCredentials {
  token: string;
}

export interface IUser {
  sub: string;
  name: string;
  email: string;
}

export interface ITestingConfig {
  authToken: string;
}

export interface IOpticTask {
  command?: string;
  baseUrl?: string;
  proxy?: string;
  useTask?: string;
  targetUrl?: string;
}

export interface IOpticScript {
  command: string;
  dependsOn?: string | string[];
  install?: string;
}

export interface IOpticTaskAliases {
  inboundUrl?: string;
}

export type IOpticTaskAliased = Partial<IOpticTask> & IOpticTaskAliases;

export interface IApiCliConfig {
  name: string;
  tasks: {
    [key: string]: IOpticTask;
  };
  scripts?: {
    [key: string]: string | IOpticScript;
  };
  environments?: IEnvironmentsConfig;
  ignoreRequests?: string[];
}

export interface IEnvironmentsConfig {
  [key: string]: {
    host: string;
    webUI?: string;
  };
}

export async function readApiConfig(
  configPath: string
): Promise<IApiCliConfig> {
  const rawFile = await fs.readFile(configPath);
  let parsed = null;
  try {
    // @ts-ignore
    return (parsed = yaml.safeLoad(rawFile.toString()));
  } catch (e) {
    throw new InvalidOpticConfigurationSyntaxError(
      '`optic.yml` will not parse. Make sure it is valid YAML.'
    );
  }
}

export async function readTestingConfig(
  testingConfigPath: string
): Promise<ITestingConfig> {
  const parsed = await fs.readJSON(testingConfigPath);

  // TODO: validate shape?
  return parsed;
}

export interface IOpticCliInitConfig {
  type: 'init';
}

export class InvalidOpticConfigurationSyntaxError extends Error {}

export class OpticConfigurationLocationFailure extends Error {}

export class CommandExecutionFailure extends Error {}

export class TargetPortUnavailableError extends Error {}

export class TaskNotFoundError extends Error {}

export class RunsWithTaskNotFoundError extends Error {}

export interface IOpticCaptureConfig {
  persistenceEngine: 'fs' | 's3';
  captureId: string;
  captureDirectory: string;
}

export interface IOpticApiRunConfig {
  type: 'run';
  captureConfig: IOpticCaptureConfig;
  // where does the service normally live?
  serviceConfig: {
    port: number;
    host: string;
    protocol: string;
    basePath: string;
  };
  // where should intercepted requests go?
  proxyConfig: {
    port: number;
    host: string;
    protocol: string;
    basePath: string;
  };
}

export interface IOpticApiInterceptConfig {
  type: 'intercept';
}

export interface IOpticTaskRunnerConfig {
  command?: string;
  hostnameFilter?: string;
  // the target service, implementing the API we're observing
  serviceConfig: {
    port: number;
    host: string;
    protocol: string;
    basePath: string;
  };
  // the proxy, in front of the target service
  proxyConfig: {
    port: number;
    host: string;
    protocol: string;
    basePath: string;
  };
}

export function randomLowerBound(): number {
  const max = 3500;
  const min = 3300;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isTestTask(aliasedTask: IOpticTaskAliased): boolean {
  return Boolean(aliasedTask.useTask && aliasedTask.command);
}

export function isRecommendedTask(aliasedTask: IOpticTaskAliased): boolean {
  return Boolean(
    aliasedTask.command && (aliasedTask.inboundUrl || aliasedTask.baseUrl)
  );
}

export function isManualTask(aliasedTask: IOpticTaskAliased): boolean {
  return Boolean(
    (aliasedTask.inboundUrl || aliasedTask.baseUrl) && aliasedTask.targetUrl
  );
}

export async function TaskToStartConfig(
  aliasedTask: IOpticTaskAliased
): Promise<IOpticTaskRunnerConfig> {
  const task = normalizeTask(aliasedTask);

  const baseUrl = url.parse(task.baseUrl!);
  const targetUrl =
    (task.targetUrl && url.parse(task.targetUrl)) ||
    (task.proxy && url.parse(task.proxy)); // TODO: add deprecation warning

  if (task.proxy) {
    warnDeprecation(Deprecations.taskProxyField);
  }

  const serviceProtocol =
    (targetUrl && targetUrl.protocol) || baseUrl.protocol || 'http:';
  const serviceConfig = {
    host: (targetUrl && targetUrl.hostname) || baseUrl.hostname || 'localhost',
    protocol: serviceProtocol,
    port:
      targetUrl && targetUrl.port
        ? parseInt(targetUrl.port) // use target port if available
        : targetUrl
        ? serviceProtocol === 'http:' // assume standard ports for targets without explicit ports
          ? 80
          : 443
        : await getPort({ port: getPort.makeRange(randomLowerBound(), 3900) }), // find available port if no explicit target set
    basePath: (targetUrl && targetUrl.path) || baseUrl.path || '/',
  };

  const proxyProtocol = baseUrl.protocol || 'http:';
  const proxyConfig = {
    host: baseUrl.hostname || 'localhost',
    protocol: proxyProtocol,
    port: baseUrl.port
      ? parseInt(baseUrl.port) // use base url port if explicitly set
      : proxyProtocol === 'http:' // assume standard port for base url without explicit port
      ? 80
      : 443,
    basePath: serviceConfig.basePath,
  };

  const hostnameFilter = targetUrl
    ? (targetUrl as url.UrlWithStringQuery).hostname!
    : undefined;

  return {
    command: task.command,
    hostnameFilter,
    serviceConfig,
    proxyConfig,
  };
}

function normalizeTask(aliased: IOpticTaskAliased): IOpticTask {
  const baseUrl = aliased.baseUrl || aliased.inboundUrl;
  if (!baseUrl && !aliased.useTask)
    throw new Error('Task definition must have baseUrl (aliases: inboundUrl)');

  if (aliased.useTask && (baseUrl || aliased.targetUrl)) {
    throw new Error(
      'Task definitions with useTask should not include an inboundUrl or targetUrl '
    );
  }

  return {
    ...aliased,
    baseUrl,
  };
}

export interface IPathMapping {
  cwd: string;
  basePath: string;
  specStorePath: string;
  specDirPath: string;
  configPath: string;
  gitignorePath: string;
  opticIgnorePath: string;
  capturesPath: string;
  exampleRequestsPath: string;
  testingConfigPath: string;
}

export async function getPathsRelativeToConfig() {
  const configPath = await findUp('optic.yml', { type: 'file' });
  if (configPath) {
    const configParentDirectory = path.resolve(configPath, '../');
    return await getPathsRelativeToCwd(configParentDirectory);
  }
  throw new OpticConfigurationLocationFailure(
    `expected to find an optic.yml file`
  );
}

export function pathsFromCwd(cwd: string): IPathMapping {
  const configPath = path.join(cwd, 'optic.yml');

  const basePath = path.join(cwd, '.optic');
  const capturesPath = path.join(basePath, 'captures');
  const gitignorePath = path.join(basePath, '.gitignore');
  const opticIgnorePath = path.join(basePath, 'ignore');
  const specDirPath = path.join(basePath, 'api');
  const specStorePath = path.join(specDirPath, 'specification.json');
  const exampleRequestsPath = path.join(specDirPath, 'example-requests');
  const testingConfigPath = path.join(basePath, 'testing.json');
  return {
    cwd,
    configPath,
    basePath,
    capturesPath,
    gitignorePath,
    opticIgnorePath,
    specDirPath,
    specStorePath,
    exampleRequestsPath,
    testingConfigPath,
  };
}

export async function getPathsRelativeToCwd(
  cwd: string
): Promise<IPathMapping> {
  const pathMapping = pathsFromCwd(cwd);
  const { capturesPath, exampleRequestsPath } = pathMapping;
  await fs.ensureDir(capturesPath);
  await fs.ensureDir(exampleRequestsPath);

  return pathMapping;
}

export async function createFileTree(config: string, basePath: string) {
  const {
    specStorePath,
    configPath,
    gitignorePath,
    opticIgnorePath,
    capturesPath,
  } = await getPathsRelativeToCwd(basePath);
  const files = [
    {
      path: gitignorePath,
      contents: `
captures/
`,
    },
    {
      path: opticIgnorePath,
      contents: defaultIgnoreFile,
    },
    {
      path: specStorePath,
      contents: JSON.stringify([]),
    },
  ];
  if (config) {
    files.push({
      path: configPath,
      contents: config,
    });
  }
  await Promise.all(
    files.map(async (file) => {
      await fs.ensureFile(file.path);
      await fs.writeFile(file.path, file.contents);
    })
  );
  await fs.ensureDir(capturesPath);
  return {
    configPath,
    basePath,
    capturesPath,
  };
}

export interface ITestingConfig {
  authToken: string;
}

export enum Modes {
  Recommended = 'Recommended',
  Manual = 'Manual',
  Test = 'Test',
}

export { parseIgnore, parseRule, IIgnoreRunnable };
