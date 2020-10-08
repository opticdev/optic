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
  isTestTask,
  isManualTask,
  isRecommendedTask,
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
import { Modes } from '@useoptic/cli-config/build';

export async function verifyTask(
  cli: Command,
  taskName: string,
  dependent: boolean = false
): Promise<boolean> {
  const config: IApiCliConfig | undefined = await niceTry(async () => {
    const paths = await getPathsRelativeToConfig();
    return await readApiConfig(paths.configPath);
  });

  if (!config) {
    cli.log(
      fromOptic(colors.red(`Please run this command from an Optic project`))
    );
    return false;
  }

  let foundTask: IOpticTaskAliased | null = null;

  let fixUrl = 'https://www.useoptic.com/docs/faqs-and-troubleshooting/';

  await niceTry(async () => {
    if (config.tasks) {
      const task = config.tasks[taskName];
      foundTask = task;
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

    return false;
  }

  if (taskExists && foundTask) {
    const mode: Modes | null = (() => {
      if (isTestTask(foundTask!)) {
        return Modes.Test;
      }

      if (isManualTask(foundTask)) {
        return Modes.Manual;
      }

      if (isRecommendedTask(foundTask)) {
        return Modes.Recommended;
      }

      return null;
    })();

    cli.log(
      '\n' +
        fromOptic(colors.underline(`Checking task ${colors.bold(taskName)}`))
    );

    if (mode === null) {
      cli.log(fromOptic(colors.red(`Invalid task configuration. `)));
      return false;
    }

    let passedAll = false;

    if (mode === Modes.Test) {
      if (dependent) {
        passedAll = false;
        cli.log(
          fromOptic(
            colors.red(
              `Test tasks can not depend on other test tasks. ${colors.bold(
                foundTask!.useTask!
              )} cannot be used here.`
            )
          )
        );
      } else {
        cli.log(
          fromOptic(
            colors.green(
              `This is a test task, checking dependent task ${colors.bold(
                foundTask!.useTask!
              )}`
            )
          )
        );

        passedAll = await verifyTask(cli, foundTask!.useTask!, true);
      }
    }

    if (mode == Modes.Recommended) {
      const startConfig = await TaskToStartConfig(foundTask!);
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
    }
    if (mode == Modes.Manual) {
      const startConfig = await TaskToStartConfig(foundTask!);
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

    if (!dependent) {
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

    return passedAll;
  }

  return false;
}
