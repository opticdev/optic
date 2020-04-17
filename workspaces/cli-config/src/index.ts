import * as fs from 'fs-extra';
import * as path from 'path';
import * as url from 'url';
import * as yaml from 'js-yaml';
import * as getPort from 'get-port';
import * as findUp from 'find-up';
import { parseRule, parseIgnore, IIgnoreRunnable } from './helpers/ignore-parser';

export interface IUserCredentials {
  token: string
}

export interface IUser {
  sub: string,
  name: string,
  email: string
}

export interface IOpticTask {
  command?: string,
  baseUrl: string
  proxy?: string
}

export interface IApiCliConfig {
  name: string
  tasks: {
    [key: string]: IOpticTask
  }
  ignoreRequests?: string[]
}

export async function readApiConfig(configPath: string): Promise<IApiCliConfig> {
  const rawFile = await fs.readFile(configPath);
  let parsed = null;
  try {
    parsed = yaml.safeLoad(rawFile.toString());
  } catch (e) {
    throw Error('`optic.yml` will not parse. Make sure it is valid YAML.');
  }
  return parsed;
}

export interface IOpticCliInitConfig {
  type: 'init'
}

export interface IOpticCaptureConfig {
  persistenceEngine: 'fs' | 's3'
  captureId: string
  captureDirectory: string
}

export interface IOpticApiRunConfig {
  type: 'run'
  captureConfig: IOpticCaptureConfig
  // where does the service normally live?
  serviceConfig: {
    port: number
    host: string
    protocol: string
    basePath: string
  }
  // where should intercepted requests go?
  proxyConfig: {
    port: number
    host: string
    protocol: string
    basePath: string
  }
}

export interface IOpticApiInterceptConfig {
  type: 'intercept'
}

export interface IOpticTaskRunnerConfig {
  command?: string
  captureId: string
  startTime: Date,
  lastUpdateTime: Date,
  persistenceEngine: 'fs' | 's3'
  // where does the service normally live?
  serviceConfig: {
    port: number
    host: string
    protocol: string
    basePath: string
  }
  // where should intercepted requests go?
  proxyConfig: {
    port: number
    host: string
    protocol: string
    basePath: string
  }
}

export async function TaskToStartConfig(task: IOpticTask, captureId: string): Promise<IOpticTaskRunnerConfig> {

  const parsedBaseUrl = url.parse(task.baseUrl);
  const randomPort = await getPort({ port: getPort.makeRange(3300, 3900) });
  const serviceProtocol = parsedBaseUrl.protocol || 'http:';
  const proxyPort = parsedBaseUrl.port || (serviceProtocol === 'http:' ? '80' : '443');
  const parsedProxyBaseUrl = task.proxy && url.parse(task.proxy);

  return {
    command: task.command,
    persistenceEngine: 'fs',
    captureId,
    startTime: new Date(),
    lastUpdateTime: new Date(),
    serviceConfig: {
      port: task.proxy ? parseInt(proxyPort, 10) : randomPort,
      host: parsedBaseUrl.hostname || 'localhost',
      protocol: serviceProtocol,
      basePath: parsedBaseUrl.path || '/'
    },
    proxyConfig: {
      port: parseInt(parsedProxyBaseUrl ? (parsedProxyBaseUrl.port || (serviceProtocol === 'http:' ? '80' : '443')) : proxyPort, 10),
      host: (parsedProxyBaseUrl ? parsedProxyBaseUrl.hostname : parsedBaseUrl.hostname) || 'localhost',
      protocol: (parsedProxyBaseUrl ? parsedProxyBaseUrl.protocol : serviceProtocol) || 'http:',
      basePath: parsedBaseUrl.path || '/'
    }
  };
}

export interface IPathMapping {
  cwd: string
  basePath: string
  specStorePath: string
  configPath: string
  gitignorePath: string
  capturesPath: string
  exampleRequestsPath: string
  tokenStorePath: string
}

export async function getPathsRelativeToConfig() {
  const configPath = await findUp('optic.yml', { type: 'file' });
  if (configPath) {
    const configParentDirectory = path.resolve(configPath, '../');
    return await getPathsRelativeToCwd(configParentDirectory);
  }
  throw new Error(`expected to find an optic.yml file`);
}

export async function getPathsRelativeToCwd(cwd: string): Promise<IPathMapping> {
  const configPath = path.join(cwd, 'optic.yml');

  const basePath = path.join(cwd, '.optic');
  const capturesPath = path.join(basePath, 'captures');
  const gitignorePath = path.join(basePath, '.gitignore');
  const specStorePath = path.join(basePath, 'api', 'specification.json');
  const exampleRequestsPath = path.join(basePath, 'api', 'example-requests');
  const tokenStorePath = path.join(basePath, 'api', 'token');
  await fs.ensureDir(capturesPath);
  await fs.ensureDir(exampleRequestsPath);

  return {
    cwd,
    basePath,
    specStorePath,
    configPath,
    gitignorePath,
    capturesPath,
    exampleRequestsPath,
    tokenStorePath
  };
}

export async function createFileTree(config: string, token: string, basePath: string) {
  const { specStorePath, configPath, gitignorePath, capturesPath, tokenStorePath } = await getPathsRelativeToCwd(basePath);
  const files = [
    {
      path: gitignorePath,
      contents: `
captures/
`
    },
    {
      path: specStorePath,
      contents: JSON.stringify([])
    },
    {
      path: tokenStorePath,
      contents: token
    }
  ];
  if (config) {
    files.push({
      path: configPath,
      contents: config
    });
  }
  await Promise.all(
    files.map(async file => {
      await fs.ensureFile(file.path);
      await fs.writeFile(file.path, file.contents);
    })
  );
  await fs.ensureDir(capturesPath);
  return {
    configPath,
    basePath,
    capturesPath
  };
}

export {
  parseIgnore,
  parseRule,
  IIgnoreRunnable
};

export async function shouldWarnAboutVersion7Compatibility() {
  const hasVersion6SpecStore = await findUp('.api', { type: 'directory' });
  const hasVersion7Config = await findUp('optic.yml', { type: 'file' });
  if (hasVersion6SpecStore) {
    return true;
  } else if (hasVersion7Config) {
    return false;
  }
  return false;
}

