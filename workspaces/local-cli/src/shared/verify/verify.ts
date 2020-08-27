//@ts-ignore
import Listr from 'listr';
import Command from '@oclif/command';
import colors from 'colors';
//@ts-ignore
import niceTry from 'nice-try';
import {
  getPathsRelativeToConfig,
  IOpticTaskRunnerConfig,
  IOpticTask,
  readApiConfig,
  TaskToStartConfig,
  IOpticTaskAliased,
  IApiCliConfig,
} from '@useoptic/cli-config';
import {
  HttpToolkitCapturingProxy,
  CommandSession,
} from '@useoptic/cli-shared';
import waitOn from 'wait-on';
import { opticTaskToProps, trackUserEvent } from '../analytics';
import { ApiCheckCompleted } from '@useoptic/analytics/lib/events/onboarding';
import { fromOptic } from '@useoptic/cli-shared';
import url from 'url';
import { buildQueryStringParser } from '@useoptic/cli-shared/build/query/build-query-string-parser';
import { verifyRecommended } from './recommended';
import { verifyManual } from './manual';
import {
  ApiProcessStartsOnAssignedHost,
  ApiProcessStartsOnAssignedPort,
  CommandIsLongRunning,
  ProxyCanStartAtInboundUrl,
  ProxyTargetUrlResolves,
} from '@useoptic/analytics/lib/interfaces/ApiCheck';

enum Modes {
  Recommended = 'Recommended',
  Manual = 'Manual',
}

export async function verifyTask(
  cli: Command,
  taskName: string
): Promise<void> {
  const config: IApiCliConfig | undefined = await niceTry(async () => {
    const paths = await getPathsRelativeToConfig();
    return await readApiConfig(paths.configPath);
  });

  if (!config) {
    return cli.log(
      fromOptic(colors.red(`Please run this command from an Optic project`))
    );
  }

  let foundTask: IOpticTaskAliased | null = null;
  let startConfig: IOpticTaskRunnerConfig | null = null;

  await niceTry(async () => {
    if (config.tasks) {
      const task = config.tasks[taskName];
      foundTask = task;
      if (foundTask) {
        startConfig = await TaskToStartConfig(task);
      }
    }
  });

  const taskExists = Boolean(foundTask);

  if (!taskExists) {
    cli.log(
      fromOptic(
        colors.red(
          `No task provided. Please run ${colors.bold(
            'api check <taskName>'
          )} with one of these tasks:`
        )
      )
    );

    cli.log(
      Object.keys(config.tasks || [])
        .map((i) => '- ' + i)
        .sort()
        .join('\n')
    );

    return;
  }

  const mode: Modes | null = (() => {
    const isManual =
      (foundTask!.inboundUrl || foundTask!.baseUrl) && foundTask!.targetUrl;
    if (isManual) {
      return Modes.Manual;
    }

    const isRecommended =
      foundTask!.command && (foundTask!.inboundUrl || foundTask!.baseUrl);
    if (isRecommended) {
      return Modes.Recommended;
    }

    return null;
  })();

  cli.log(
    '\n' + fromOptic(colors.underline(`Testing task ${colors.bold(taskName)}`))
  );

  if (mode === null) {
    return cli.log(fromOptic(colors.red(`Invalid task configuration. `)));
  }

  let passedAll = false;

  if (mode == Modes.Recommended) {
    const results = await verifyRecommended(foundTask!, startConfig!);
    passedAll = results.passedAll;

    await trackUserEvent(
      ApiCheckCompleted.withProps({
        passed: passedAll,
        mode: mode,
        taskName: taskName,
        task: {
          ...foundTask!,
        },
        recommended: {
          commandIsLongRunning: results.assertions.longRunningAssertion,
          apiProcessStartsOnAssignedHost:
            results.assertions.startOnHostAssertion,
          apiProcessStartsOnAssignedPort:
            results.assertions.startOnPortAssertion,
          proxyCanStartAtInboundUrl:
            results.assertions.proxyCanStartAtInboundUrl,
        },
      })
    );
  } else {
    const results = await verifyManual(foundTask!, startConfig!);
    passedAll = results.passedAll;
    await trackUserEvent(
      ApiCheckCompleted.withProps({
        passed: passedAll,
        mode: mode,
        taskName: taskName,
        task: {
          ...foundTask!,
        },
        manual: {
          proxyCanStartAtInboundUrl:
            results.assertions.proxyCanStartAtInboundUrl,
          proxyTargetUrlResolves: results.assertions.isTargetResolvable,
        },
      })
    );
  }

  if (passedAll) {
    cli.log(
      '\n' +
        fromOptic(
          colors.green.bold(
            `All Passed! This task is setup properly. Nice work!`
          )
        )
    );
  } else {
    cli.log(
      '\n' +
        fromOptic(
          colors.red.bold(
            `Some checks failed. Steps to fix can be found here: useoptic.com/docs/check-fail`
          )
        )
    );
    // console.log(results);
  }
}
