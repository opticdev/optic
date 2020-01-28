import Command from '@oclif/command';
import {Client} from '@useoptic/cli-client';
import {IOpticTaskRunnerConfig, parseIgnore, TaskToStartConfig} from '@useoptic/cli-config';
import {getPathsRelativeToConfig, readApiConfig, shouldWarnAboutVersion7Compatibility} from '@useoptic/cli-config';
import {IApiCliConfig, IPathMapping} from '@useoptic/cli-config';
import {ensureDaemonStarted, ensureDaemonStopped, FileSystemCaptureSaver} from '@useoptic/cli-server';
import {ICaptureSaver, ICliDaemonState} from '@useoptic/cli-server';
import {FileSystemCaptureLoader, ICaptureLoader} from '@useoptic/cli-server';
import {makeUiBaseUrl} from '@useoptic/cli-server';
import {checkDiffOrUnrecognizedPath} from '@useoptic/domain';
import * as colors from 'colors';
import {fromOptic} from './conversation';
import {developerDebugLogger, userDebugLogger} from './logger';
import {lockFilePath} from './paths';
import Init from '../commands/init';
import {CommandAndProxySessionManager} from './command-and-proxy-session-manager';
import * as uuidv4 from 'uuid/v4';
import findProcess = require('find-process');
import openBrowser = require('react-dev-utils/openBrowser');

async function setupTaskWithConfig(cli: Command, taskName: string, paths: IPathMapping, config: IApiCliConfig) {
  const {cwd, capturesPath, specStorePath} = paths;
  const task = config.tasks[taskName];
  if (!task) {
    return cli.log(colors.red(`No task ${colors.bold(taskName)} found in optic.yml`));
  }

  const captureId = uuidv4();
  const startConfig = await TaskToStartConfig(task, captureId);

  const blockers = await findProcess('port', startConfig.proxyConfig.port);
  if (blockers.length > 0) {
    cli.error(`Optic needs to start a proxy server on port ${startConfig.proxyConfig.port}.
There is something else running on this port:
${blockers.map(x => `[pid ${x.pid}]: ${x.cmd}`).join('\n')}
`);
  }

  const daemonState = await ensureDaemonStarted(lockFilePath);

  const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
  developerDebugLogger(`api base url: ${apiBaseUrl}`);
  const cliClient = new Client(apiBaseUrl);
  const cliSession = await cliClient.findSession(cwd, startConfig);
  developerDebugLogger({cliSession});
  const uiBaseUrl = makeUiBaseUrl(daemonState);
  const uiUrl = `${uiBaseUrl}/specs/${cliSession.session.id}/diff/${captureId}`;
  cli.log(fromOptic(`Review the API Diff live at ${uiUrl}`));

  // start proxy and command session
  const persistenceManagerFactory = () => {
    return new FileSystemCaptureSaver({
      captureBaseDirectory: capturesPath
    });
  };
  try {
    await runTask(startConfig, persistenceManagerFactory);
  } catch (e) {
    cli.error(e.message);
  } finally {

    const loader: ICaptureLoader = new FileSystemCaptureLoader({
      captureBaseDirectory: capturesPath
    });
    await cliClient.markCaptureAsCompleted(cliSession.session.id, captureId);
    const filter = parseIgnore(config.ignoreRequests || []);
    const capture = await loader.loadWithFilter(captureId, filter);

    if (await checkDiffOrUnrecognizedPath(specStorePath, capture.samples)) {
      const uiUrl = `${uiBaseUrl}/specs/${cliSession.session.id}/diff/${captureId}`;
      openBrowser(uiUrl);
    }
  }
}

export async function setupTask(cli: Command, taskName: string) {

  // const shouldWarn = shouldWarnAboutVersion7Compatibility();
  // if (shouldWarn) {
  //   this.log(fromOptic(`Optic >=7 replaced the ${colors.blue('.api')} folder with a ${colors.green('.optic')} folder.\n Read full migration guide here.`));
  //   return;
  // }
  try {
    const paths = await getPathsRelativeToConfig();
    const config = await readApiConfig(paths.configPath);
    try {
      await setupTaskWithConfig(cli, taskName, paths, config);
    } catch (e) {
      cli.error(e);
    }
  } catch (e) {
    userDebugLogger(e);
    cli.log(fromOptic('Optic needs more information about your API to continue.'));
    await Init.run([]);
    process.exit(0);
  }
  process.exit(0);
}

export async function runTask(taskConfig: IOpticTaskRunnerConfig, persistenceManagerFactory: () => ICaptureSaver): Promise<void> {
  const sessionManager = new CommandAndProxySessionManager(taskConfig);

  const persistenceManager = persistenceManagerFactory();

  await sessionManager.run(persistenceManager);

  if (process.env.OPTIC_ENV === 'development') {
    await ensureDaemonStopped(lockFilePath);
  }
}
