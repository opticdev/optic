import Command from '@oclif/command';
import { Client } from '@useoptic/cli-client';
import {
  InvalidOpticConfigurationSyntaxError,
  IOpticTaskRunnerConfig,
  OpticConfigurationLocationFailure,
  parseIgnore,
  TargetPortUnavailableError,
  TaskNotFoundError,
  TaskToStartConfig,
} from '@useoptic/cli-config';
import { getPathsRelativeToConfig, readApiConfig } from '@useoptic/cli-config';
import { IApiCliConfig, IPathMapping } from '@useoptic/cli-config';
import {
  ensureDaemonStarted,
  ensureDaemonStopped,
  FileSystemCaptureSaver,
} from '@useoptic/cli-server';
import { ICaptureSaver, ICliDaemonState } from '@useoptic/cli-server';
import { FileSystemCaptureLoader, ICaptureLoader } from '@useoptic/cli-server';
import { makeUiBaseUrl } from '@useoptic/cli-server';
import { checkDiffOrUnrecognizedPath } from '@useoptic/domain';
import * as colors from 'colors';
import * as path from 'path';
import * as cp from 'child_process';
import { fromOptic } from './conversation';
import { developerDebugLogger, userDebugLogger } from './logger';
import { lockFilePath } from './paths';
import { CommandAndProxySessionManager } from './command-and-proxy-session-manager';
import * as uuidv4 from 'uuid/v4';
import findProcess = require('find-process');
import {
  getCredentials,
  getUserFromCredentials,
} from './authentication-server';
import { basePath } from '@useoptic/cli-scripts';

async function setupTaskWithConfig(
  cli: Command,
  taskName: string,
  paths: IPathMapping,
  config: IApiCliConfig
) {
  const { cwd, capturesPath, specStorePath } = paths;
  const task = config.tasks[taskName];
  if (!task) {
    throw new TaskNotFoundError(
      `No task ${colors.bold(taskName)} found in optic.yml`
    );
  }

  const captureId = uuidv4();
  const startConfig = await TaskToStartConfig(task, captureId);

  const blockers = await findProcess('port', startConfig.proxyConfig.port);
  if (blockers.length > 0) {
    throw new TargetPortUnavailableError(`Optic needs to start a proxy server on port ${
      startConfig.proxyConfig.port
    }.
There is something else running on this port:
${blockers.map((x) => `[pid ${x.pid}]: ${x.cmd}`).join('\n')}
`);
  }

  const daemonState = await ensureDaemonStarted(lockFilePath);
  const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
  developerDebugLogger(`api base url: ${apiBaseUrl}`);
  const cliClient = new Client(apiBaseUrl);

  const credentials = await getCredentials();
  if (credentials) {
    const user = await getUserFromCredentials(credentials);
    await cliClient.setIdentity(user);
  }

  const cliSession = await cliClient.findSession(cwd, startConfig);
  developerDebugLogger({ cliSession });

  const uiBaseUrl = makeUiBaseUrl(daemonState);
  const uiUrl = `${uiBaseUrl}/apis/${cliSession.session.id}/diffs`;
  cli.log(fromOptic(`Review the API Diff live at ${uiUrl}`));

  // start proxy and command session
  const persistenceManagerFactory = () => {
    return new FileSystemCaptureSaver({
      captureBaseDirectory: capturesPath,
    });
  };
  try {
    await runTask(startConfig, persistenceManagerFactory);
  } catch (e) {
    cli.error(e.message);
  } finally {
    const loader: ICaptureLoader = new FileSystemCaptureLoader({
      captureBaseDirectory: capturesPath,
    });

    await cliClient.markCaptureAsCompleted(cliSession.session.id, captureId);
    const filter = parseIgnore(config.ignoreRequests || []);
    const capture = await loader.loadWithFilter(captureId, filter);

    const hasDiff = await checkDiffOrUnrecognizedPath(
      specStorePath,
      capture.samples
    );
    if (hasDiff) {
      const uiUrl = `${uiBaseUrl}/apis/${cliSession.session.id}/diffs/${captureId}`;
      const notifyScriptPath = path.join(basePath, 'notify');
      const iconPath = path.join(__dirname, '../../assets/optic-logo-png.png');
      runStandaloneScript(notifyScriptPath, uiUrl, iconPath);
      cli.log(
        fromOptic(
          `Observed Unexpected API Behavior. Click here to review: ${uiUrl}`
        )
      );
    } else {
      if (capture.samples.length > 0) {
        cli.log(
          fromOptic(
            `No API Diff Observed for ${capture.samples.length} interactions`
          )
        );
      }
    }
  }
}

export function runStandaloneScript(modulePath: string, ...args: string[]) {
  const child = cp.fork(modulePath, args, { detached: true, stdio: 'ignore' });
  return child;
}

export async function setupTask(cli: Command, taskName: string) {
  try {
    const paths = await getPathsRelativeToConfig();
    const config = await readApiConfig(paths.configPath);
    try {
      await setupTaskWithConfig(cli, taskName, paths, config);
    } catch (e) {
      if (e instanceof TargetPortUnavailableError) {
        cli.log(fromOptic(e.message));
      } else if (e instanceof TaskNotFoundError) {
        cli.log(fromOptic(`No task named ${taskName} found in optic.yml`));
      } else {
        cli.error(e);
      }
    }
  } catch (e) {
    userDebugLogger(e);
    if (e instanceof OpticConfigurationLocationFailure) {
      cli.log(
        fromOptic(
          `No Optic project found in this directory. Learn to add Optic to your project here ${colors.underline(
            'https://docs.useoptic.com/setup'
          )}`
        )
      );
    } else if (e instanceof InvalidOpticConfigurationSyntaxError) {
      cli.log(fromOptic(`The contents of optic.yml are not valid YAML`));
    }

    process.exit(0);
  }
  process.exit(0);
}

export async function runTask(
  taskConfig: IOpticTaskRunnerConfig,
  persistenceManagerFactory: () => ICaptureSaver
): Promise<void> {
  const sessionManager = new CommandAndProxySessionManager(taskConfig);

  const persistenceManager = persistenceManagerFactory();

  await sessionManager.run(persistenceManager);

  if (process.env.OPTIC_ENV === 'development') {
    await ensureDaemonStopped(lockFilePath);
  }
}
