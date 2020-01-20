import * as fs from 'fs-extra';
import * as path from 'path';
import * as url from 'url';
import * as yaml from 'js-yaml';
import getPort from 'get-port';
import findUp from 'find-up';


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
}

export async function readApiConfig(): Promise<IApiCliConfig> {
  const {configPath} = await getPaths();
  const rawFile = await fs.readFile(configPath);
  let parsed = null
  try {
    parsed = yaml.safeLoad(rawFile.toString())
  } catch (e) {
    throw Error('`optic.yml` will not parse. Make sure it is valid YAML.')
  }
  return parsed;
}


export interface IOpticTaskRunnerConfig {
  command?: string
  captureId: string
  startTime: string
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
  const randomPort = await getPort({port: getPort.makeRange(3300, 3900)});
  const serviceProtocol = parsedBaseUrl.protocol || 'http:';
  const proxyPort = parsedBaseUrl.port || (serviceProtocol === 'http:' ? '80' : '443');

  const parsedProxyBaseUrl = task.proxy && url.parse(task.proxy);

  return {
    command: task.command,
    startTime: new Date().toISOString(),
    captureId,
    serviceConfig: {
      port: randomPort,
      host: parsedBaseUrl.hostname || 'localhost',
      protocol: serviceProtocol,
      basePath: parsedBaseUrl.path || '/',
    },
    proxyConfig: {
      port: parseInt(parsedProxyBaseUrl ? (parsedProxyBaseUrl.port || (serviceProtocol === 'http:' ? '80' : '443')) : proxyPort, 10),
      host: (parsedProxyBaseUrl ? parsedProxyBaseUrl.hostname : parsedBaseUrl.hostname) || 'localhost',
      protocol: (parsedProxyBaseUrl ? parsedProxyBaseUrl.protocol : serviceProtocol) || 'http:',
      basePath: parsedBaseUrl.path || '/',
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
  outputPath: string
}

export async function getPaths() {
  const rootPath = await (async () => {
    const configPath = await findUp('optic.yml', {type: 'file'});
    if (configPath) {
      return path.resolve(configPath, '../');
    }
    throw new Error(`expected to find an optic.yml file`);
  })();

  return getPathsRelativeToCwd(rootPath);
}

export async function getPathsRelativeToCwd(cwd: string): Promise<IPathMapping> {
  const configPath = path.join(cwd, 'optic.yml');

  const basePath = path.join(cwd, '.optic');
  const capturesPath = path.join(basePath, 'captures');
  const gitignorePath = path.join(basePath, '.gitignore');
  const specStorePath = path.join(basePath, 'api', 'specification.json');
  const exampleRequestsPath = path.join(basePath, 'api', 'example-requests');
  await fs.ensureDir(capturesPath);
  await fs.ensureDir(exampleRequestsPath);
  const outputPath = path.join(basePath, 'generated');

  return {
    cwd,
    basePath,
    specStorePath,
    configPath,
    gitignorePath,
    capturesPath,
    exampleRequestsPath,
    outputPath,
  };
}

export async function createFileTree(config: IApiCliConfig, basePath: string) {
  const {specStorePath, configPath, gitignorePath, capturesPath} = await getPathsRelativeToCwd(basePath);
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
  ];
  if (config) {
    files.push({
      path: configPath,
      contents: yaml.safeDump(config)
    });
  }
  await Promise.all(
    files.map(async file => {
      await fs.ensureFile(file.path);
      await fs.writeFile(file.path, file.contents);
    })
  );
  await fs.ensureDir(capturesPath);
}

export async function shouldWarnAboutVersion7Compatibility() {
  const hasVersion6SpecStore = await findUp('.api/spec-store.json', {type: 'file'});
  const hasVersion7Config = await findUp('optic.yml', {type: 'file'});
  console.log({
    hasVersion6SpecStore,
    hasVersion7Config
  });
  if (!hasVersion6SpecStore) {
    return false;
  }
  return !hasVersion7Config;
}
