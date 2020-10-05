import { Command, flags } from '@oclif/command';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import path from 'path';
import colors from 'colors';
import {
  IApiCliConfig,
  IOpticTaskRunnerConfig,
  IPathMapping,
  TargetPortUnavailableError,
  deprecationLogger,
  isTestTask,
} from '@useoptic/cli-config';
import { opticTaskToProps, trackUserEvent } from './analytics';
import { lockFilePath } from './paths';
import { Client, SpecServiceClient } from '@useoptic/cli-client';
import findProcess from 'find-process';
import stripAnsi from 'strip-ansi';
import cliux from 'cli-ux';
import {
  ExitedTaskWithLocalCli,
  StartedTaskWithLocalCli,
} from '@useoptic/analytics/lib/events/tasks';

import {
  getCredentials,
  getUserFromCredentials,
} from './authentication-server';
import { runScriptByName } from '@useoptic/cli-scripts';
import {
  cleanupAndExit,
  CommandAndProxySessionManager,
  developerDebugLogger,
  fromOptic,
  IOpticTaskRunner,
  loadPathsAndConfig,
  makeUiBaseUrl,
  warningFromOptic,
} from '@useoptic/cli-shared';
import * as uuid from 'uuid';
import { CliTaskSession } from '@useoptic/cli-shared/build/tasks';
import { CaptureSaverWithDiffs } from '@useoptic/cli-shared/build/captures/avro/file-system/capture-saver-with-diffs';
import { EventEmitter } from 'events';
import { Config } from '../config';
import { printCoverage } from './coverage';
import { spawnProcess } from './spawn-process';
import { command } from '@oclif/test';

export const runCommandFlags = {
  coverage: flags.boolean({ char: 'c', default: false, required: false }),
};
interface LocalCliTaskFlags {
  coverage?: boolean;
}

export async function LocalTaskSessionWrapper(
  cli: Command,
  taskName: string,
  flags: LocalCliTaskFlags
) {
  // hijack the config deprecation log to format nicely for the CLI
  deprecationLogger.log = (msg: string) => {
    cli.log(
      warningFromOptic(
        'optic.yml deprecation: ' +
          stripAnsi(msg).replace(deprecationLogger.namespace, '').trim()
      )
    );
  };
  deprecationLogger.enabled = true;

  const { paths, config } = await loadPathsAndConfig(cli);
  const captureId = uuid.v4();
  const runner = new LocalCliTaskRunner(captureId, paths);
  const session = new CliTaskSession(runner);

  const task = config.tasks[taskName];
  if (task && isTestTask(task)) {
    cli.log(
      fromOptic(`Running dependent task ${colors.grey.bold(task.useTask!)}...`)
    );
    await session.start(cli, config, task.useTask!, task.command!);
  } else {
    await session.start(cli, config, taskName);
  }

  if (flags.coverage) {
    await printCoverage(paths, taskName, captureId);
  }

  return await cleanupAndExit();
}

export class LocalCliTaskRunner implements IOpticTaskRunner {
  constructor(private captureId: string, private paths: IPathMapping) {}

  async run(
    cli: Command,
    config: IApiCliConfig,
    taskConfig: IOpticTaskRunnerConfig,
    commandToRunWhenStarted?: string
  ): Promise<void> {
    ////////////////////////////////////////////////////////////////////////////////

    await trackUserEvent(
      StartedTaskWithLocalCli.withProps({
        inputs: opticTaskToProps('', taskConfig),
        cwd: this.paths.cwd,
        captureId: this.captureId,
      })
    );

    ////////////////////////////////////////////////////////////////////////////////

    const blockers = await findProcess('port', taskConfig.proxyConfig.port);
    if (blockers.length > 0) {
      throw new TargetPortUnavailableError(`Optic could not start its proxy server on port ${
        taskConfig.proxyConfig.port
      }.
There is something else running:
${blockers.map((x) => `[pid ${x.pid}]: ${x.cmd}`).join('\n')}
`);
    }

    ////////////////////////////////////////////////////////////////////////////////

    const daemonState = await ensureDaemonStarted(
      lockFilePath,
      Config.apiBaseUrl
    );
    const apiBaseUrl = `http://localhost:${daemonState.port}/api`;
    developerDebugLogger(`api base url: ${apiBaseUrl}`);
    const cliClient = new Client(apiBaseUrl);

    ////////////////////////////////////////////////////////////////////////////////
    developerDebugLogger('checking credentials');
    const credentials = await getCredentials();
    if (credentials) {
      const user = await getUserFromCredentials(credentials);
      await cliClient.setIdentity(user);
    }

    ////////////////////////////////////////////////////////////////////////////////
    developerDebugLogger('finding matching daemon session');

    const { cwd } = this.paths;
    const cliSession = await cliClient.findSession(
      cwd,
      taskConfig,
      this.captureId
    );
    developerDebugLogger({ cliSession });

    ////////////////////////////////////////////////////////////////////////////////

    const uiBaseUrl = makeUiBaseUrl(daemonState);
    const uiUrl = `${uiBaseUrl}/apis/${cliSession.session.id}/diffs`;
    cli.log(fromOptic(`Review the API Diff at ${uiUrl}`));

    ////////////////////////////////////////////////////////////////////////////////
    const { capturesPath } = this.paths;
    const captureId = this.captureId;
    const eventEmitter = new EventEmitter();
    const specServiceClient = new SpecServiceClient(
      cliSession.session.id,
      eventEmitter,
      apiBaseUrl
    );
    const persistenceManager = new CaptureSaverWithDiffs(
      {
        captureBaseDirectory: capturesPath,
        captureId,
      },
      config,
      specServiceClient
    );

    ////////////////////////////////////////////////////////////////////////////////
    process.env.OPTIC_ENABLE_CAPTURE_BODY = 'yes';

    const testCommand = commandToRunWhenStarted
      ? () => {
          console.log(
            fromOptic(
              'Running test command ' +
                colors.grey.bold(commandToRunWhenStarted)
            )
          );
          spawnProcess(commandToRunWhenStarted!, {
            OPTIC_PROXY_PORT: taskConfig.proxyConfig.port.toString(),
            OPTIC_PROXY_HOST: taskConfig.proxyConfig.host.toString(),
            OPTIC_PROXY: `http://${taskConfig.proxyConfig.host.toString()}:${taskConfig.proxyConfig.port.toString()}`,
          });
        }
      : undefined;

    const sessionManager = new CommandAndProxySessionManager(
      taskConfig,
      testCommand
    );

    await sessionManager.run(persistenceManager);

    ////////////////////////////////////////////////////////////////////////////////
    await cliClient.markCaptureAsCompleted(cliSession.session.id, captureId);
    const summary = await specServiceClient.getCaptureStatus(captureId);
    const sampleCount = summary.interactionsCount;
    const hasDiff = summary.diffsCount > 0;

    trackUserEvent(
      ExitedTaskWithLocalCli.withProps({
        interactionCount: sampleCount,
        inputs: opticTaskToProps('', taskConfig),
        captureId: this.captureId,
      })
    );

    if (hasDiff) {
      const uiUrl = `${uiBaseUrl}/apis/${cliSession.session.id}/diffs/${captureId}`;
      const iconPath = path.join(__dirname, '../../assets/optic-logo-png.png');
      runScriptByName('notify', uiUrl, iconPath);

      cli.log(
        fromOptic(
          `Observed Unexpected API Behavior. Click here to review: ${uiUrl}`
        )
      );
    } else {
      if (sampleCount > 0) {
        cli.log(
          fromOptic(`No API Diff Observed for ${sampleCount} interactions`)
        );
      }
    }
  }
}
