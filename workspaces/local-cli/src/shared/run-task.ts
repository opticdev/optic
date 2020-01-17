import Command from '@oclif/command';
import {Client} from '@useoptic/cli-client';
import {IApiCliConfig, TaskToStartConfig} from '@useoptic/cli-config';
import {IOpticTask} from '@useoptic/cli-config';
import {FileSystemSessionPersistence, FileSystemSessionLoader} from '@useoptic/cli-server';
import {getPaths, readApiConfig, shouldWarnAboutVersion7Compatibility} from '@useoptic/cli-config';
import {ensureDaemonStarted, ensureDaemonStopped} from '@useoptic/cli-server';
import * as path from 'path';
import * as colors from 'colors';
import {fromOptic} from './conversation';
import {lockFilePath} from './paths';
import openBrowser = require('react-dev-utils/openBrowser.js');
import Init from '../commands/init';
import {CommandAndProxySessionManager} from './command-and-proxy-session-manager';


export async function setupTask(cli: Command, taskName: string) {

  // const shouldWarn = shouldWarnAboutVersion7Compatibility();
  // if (shouldWarn) {
  //   this.log(fromOptic(`Optic >=7 replaced the ${colors.blue('.api')} folder with a ${colors.green('.optic')} folder.\n Read full migration guide here.`));
  //   return;
  // }
  let config;
  try {
    config = await readApiConfig();
  } catch (e) {
    console.error(e);
    cli.log(fromOptic('Optic needs more information about your API to continue.'));
    await Init.run([]);
    process.exit(0);
  }

  const {cwd} = await getPaths();
  const task = config.tasks[taskName];
  if (!task) {
    return cli.log(colors.red(`No task ${colors.bold(taskName)} found in optic.yml`));
  }

  if (process.env.OPTIC_ENV === 'development') {
    await ensureDaemonStopped(lockFilePath);
  }
  const daemonState = await ensureDaemonStarted(lockFilePath);

  const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
  cli.log(apiBaseUrl);
  const cliClient = new Client(apiBaseUrl);
  const cliSession = await cliClient.findSession(cwd);
  console.log({cliSession});
  const uiUrl = `http://localhost:${daemonState.port}/specs/${cliSession.session.id}`;
  cli.log(uiUrl);
  openBrowser(uiUrl);

  // start proxy and command session
  await runTask(config, task);

  if (process.env.OPTIC_ENV === 'development') {
    await ensureDaemonStopped(lockFilePath);
  }
  process.exit(0);
}

export async function runTask(config: IApiCliConfig, task: IOpticTask): Promise<void> {
  const startConfig = await TaskToStartConfig(task);

  const sessionManager = new CommandAndProxySessionManager(startConfig);

  const persistenceManager = new FileSystemSessionPersistence({
    captureBaseDirectory: path.join('.optic', 'captures')
  });

  await sessionManager.run(persistenceManager);

  const sessionLoader = new FileSystemSessionLoader({
    captureBaseDirectory: path.join('.optic', 'captures')
  });
  await sessionLoader.load('sss');

}
