import Command from '@oclif/command';
import {Client} from '@useoptic/cli-client';
import {IOpticTaskRunnerConfig, TaskToStartConfig} from '@useoptic/cli-config';
import {getPathsRelativeToConfig, readApiConfig, shouldWarnAboutVersion7Compatibility} from '@useoptic/cli-config';
import {ensureDaemonStarted, ensureDaemonStopped, FileSystemCaptureSaver} from '@useoptic/cli-server';
import {ICaptureSaver} from '@useoptic/cli-server';
import * as colors from 'colors';
import {fromOptic} from './conversation';
import {developerDebugLogger, userDebugLogger} from './logger';
import {lockFilePath} from './paths';
import openBrowser = require('react-dev-utils/openBrowser.js');
import Init from '../commands/init';
import {CommandAndProxySessionManager} from './command-and-proxy-session-manager';
import * as uuidv4 from 'uuid/v4';
import findProcess = require('find-process');

export async function setupTask(cli: Command, taskName: string) {
  const {cwd, capturesPath, configPath} = await getPathsRelativeToConfig();

  // const shouldWarn = shouldWarnAboutVersion7Compatibility();
  // if (shouldWarn) {
  //   this.log(fromOptic(`Optic >=7 replaced the ${colors.blue('.api')} folder with a ${colors.green('.optic')} folder.\n Read full migration guide here.`));
  //   return;
  // }
  let config;
  try {
    config = await readApiConfig(configPath);
  } catch (e) {
    userDebugLogger(e);
    cli.log(fromOptic('Optic needs more information about your API to continue.'));
    await Init.run([]);
    process.exit(0);
  }

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
  const uiUrl = `http://localhost:${3000/*TODO revert*/}/specs/${cliSession.session.id}/diff/${captureId}`;
  cli.log(fromOptic(`Review the API Diff live at ${uiUrl}`));
  // openBrowser(uiUrl);

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
    await cliClient.markCaptureAsCompleted(cliSession.session.id, captureId)
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
