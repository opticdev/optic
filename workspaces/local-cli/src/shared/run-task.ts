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
import { ICaptureSaver } from '@useoptic/cli-server';
import { FileSystemCaptureLoader, ICaptureLoader } from '@useoptic/cli-server';
import { makeUiBaseUrl } from '@useoptic/cli-server';
import { checkDiffOrUnrecognizedPath } from '@useoptic/domain';
import { errorFromOptic, fromOptic } from './conversation';
import { developerDebugLogger, userDebugLogger } from './logger';
import { lockFilePath } from './paths';
import { CommandAndProxySessionManager } from './command-and-proxy-session-manager';
import {
  getCredentials,
  getUserFromCredentials,
} from './authentication-server';
import { basePath, runStandaloneScript } from '@useoptic/cli-scripts';
import { trackAndSpawn } from './analytics';
import * as colors from 'colors';
import * as path from 'path';
import findProcess = require('find-process');
import { SaasCaptureSaver } from '@useoptic/cli-server';
import * as uuid from 'uuid';

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

  const captureId = uuid.v4();
  const startConfig = await TaskToStartConfig(task, captureId);

  trackAndSpawn('Run Task with Local CLI', { task });

  const blockers = await findProcess('port', startConfig.proxyConfig.port);
  if (blockers.length > 0) {
    throw new TargetPortUnavailableError(`Optic could not start its proxy server on port ${
      startConfig.proxyConfig.port
    }.
There is something else running:
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
    if (process.env.OPTIC_PERSISTENCE_METHOD === 'saas') {
      if (!process.env.OPTIC_SAAS_AGENT_GROUP_ID) {
        throw new Error(`I need OPTIC_SAAS_AGENT_GROUP_ID`);
      }
      if (!process.env.OPTIC_SAAS_API_BASE_URL) {
        throw new Error(`I need OPTIC_SAAS_API_BASE_URL`);
      }
      if (!process.env.OPTIC_SAAS_LAUNCH_TOKEN) {
        throw new Error(`I need OPTIC_SAAS_LAUNCH_TOKEN`);
      }
      if (!process.env.OPTIC_SAAS_ORG_ID) {
        throw new Error(`I need OPTIC_SAAS_ORG_ID`);
      }
      if (!process.env.OPTIC_SAAS_CAPTURE_ID) {
        throw new Error(`I need OPTIC_SAAS_CAPTURE_ID`);
      }
      return new SaasCaptureSaver({
        orgId: process.env.OPTIC_SAAS_ORG_ID,
        agentGroupId: process.env.OPTIC_SAAS_AGENT_GROUP_ID,
        agentId: uuid.v4(),
        baseUrl: process.env.OPTIC_SAAS_API_BASE_URL,
        launchTokenString: process.env.OPTIC_SAAS_LAUNCH_TOKEN,
        captureId: process.env.OPTIC_SAAS_CAPTURE_ID,
      });
    }
    throw new Error('xxx');
    return new FileSystemCaptureSaver({
      captureBaseDirectory: capturesPath,
    });
  };
  try {
    await runTask(startConfig, persistenceManagerFactory);
  } catch (e) {
    cli.error(colors.red(e.message));
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

    trackAndSpawn('Local Capture Completed', {
      task,
      sampleCount: capture.samples.length,
      hasDiff,
    });

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

export async function setupTask(cli: Command, taskName: string) {
  try {
    const paths = await getPathsRelativeToConfig();
    const config = await readApiConfig(paths.configPath);
    try {
      await setupTaskWithConfig(cli, taskName, paths, config);
    } catch (e) {
      if (e instanceof TargetPortUnavailableError) {
        cli.log(errorFromOptic(e.message));
      } else if (e instanceof TaskNotFoundError) {
        cli.log(errorFromOptic(`No task named ${taskName} found in optic.yml`));
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

  await persistenceManager.cleanup();

  if (process.env.OPTIC_ENV === 'development') {
    await ensureDaemonStopped(lockFilePath);
  }
}
