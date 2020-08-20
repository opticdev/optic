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

enum Modes {
  Recommended,
  Manual,
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

  let fixUrl = 'https://docs.useoptic.com/faqs-and-troubleshooting/';

  await niceTry(async () => {
    const task = config.tasks[taskName];
    foundTask = task;
    if (foundTask) {
      startConfig = await TaskToStartConfig(task);
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
      Object.keys(config!.tasks)
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

  if (mode == Modes.Recommended) {
    const results = await verifyRecommended(foundTask!, startConfig!);
    if (results.passedAll) {
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
    }
  } else {
    const results = await verifyManual(foundTask!, startConfig!);
    if (results.passedAll) {
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
}

// const RecommendedCheckSteps = new Listr([
//   {
//     title: `Task '${taskName} has a 'command' and / or a 'targetUrl'`,
//     task: async () => {
//       if (!foundTask!.command && !foundTask!.targetUrl && !foundTask!.proxy) {
//         // TODO: add fix URL
//         throw new Error(
//           `A command and / or a targetUrl is required for Optic to know where to forward traffic`
//         );
//       }
//     },
//   },
//   {
//     title: `The command provided starts your API on the ${colors.bold(
//       '$OPTIC_API_PORT'
//     )}`,
//     enabled: () => startConfig && !!startConfig.command,
//     task: async (cxt: any, task: any) => {
//       const commandSession = new CommandSession();
//
//       const serviceConfig = startConfig!.serviceConfig;
//       const servicePort = serviceConfig.port;
//       const serviceHost = serviceConfig.host;
//       const opticServiceConfig = {
//         OPTIC_API_PORT: servicePort.toString(),
//         OPTIC_API_HOST: serviceHost.toString(),
//       };
//
//       const expected = `${serviceConfig.host}:${serviceConfig.port}`;
//
//       task.title = `Your command, ${colors.bold.blue(
//         startConfig!.command!
//       )}, starts your API on the host and port Optic assigned it ${colors.bold(
//         expected
//       )}`;
//
//       await commandSession.start(
//         {
//           command: startConfig!.command!,
//           // @ts-ignore
//           environmentVariables: {
//             ...process.env,
//             ...opticServiceConfig,
//           },
//         },
//         true
//       );
//
//       let status = 'running';
//       let serviceRunning = false;
//
//       const commandStoppedPromise = new Promise((resolve) => {
//         commandSession.events.on('stopped', ({ state }) => {
//           status = state;
//           resolve();
//         });
//       });
//
//       const serviceRunningPromise = new Promise(async (resolve) => {
//         waitOn({
//           resources: [`tcp:${expected}`],
//           delay: 0,
//           tcpTimeout: 500,
//           timeout: 25000,
//         })
//           .then(() => {
//             serviceRunning = true;
//             resolve(true);
//           }) //if service resolves we assume it's up.
//           .catch(() => resolve(false));
//       });
//
//       const finished = await Promise.race([
//         commandStoppedPromise,
//         serviceRunningPromise,
//       ]);
//
//       commandSession.stop();
//
//       if (status !== 'running') {
//         fixUrl =
//           fixUrl +
//           'common-issues#error-2-your-command-exited-early-or-was-not-long-running';
//         throw new Error('Your command exited early or was not long-running.');
//       }
//
//       if (!serviceRunning) {
//         fixUrl =
//           fixUrl +
//           'common-issues#error-3-your-api-did-not-start-on-the-expected-port';
//         throw new Error(
//           `Your API was not started on the expected port ${expected}`
//         );
//       }
//     },
//   },
//   {
//     title: `Optic can start`,
//     task: async (cxt: any, task: any) => {
//       const proxyConfig = startConfig!.proxyConfig;
//       const proxyPort = proxyConfig.port;
//       const proxyHost = proxyConfig.host;
//
//       const serviceConfig = startConfig!.serviceConfig;
//       const servicePort = serviceConfig.port;
//       const serviceHost = serviceConfig.host;
//
//       const expected = `${proxyHost}:${proxyPort}`;
//
//       task.title = `Optic proxy can start on ${expected}`;
//
//       const inboundProxy = new HttpToolkitCapturingProxy();
//
//       const target = url.format({
//         hostname: serviceHost,
//         port: servicePort,
//         protocol: serviceConfig.protocol,
//       });
//
//       await inboundProxy.start({
//         flags: {
//           includeTextBody: true,
//           includeJsonBody: true,
//           includeShapeHash: true,
//           includeQueryString: true,
//         },
//         host: proxyConfig.host,
//         proxyTarget:
//           process.env.OPTIC_ENABLE_TRANSPARENT_PROXY === 'yes'
//             ? undefined
//             : target,
//         proxyPort: proxyConfig.port,
//         queryParser: buildQueryStringParser(),
//       });
//
//       const proxyRunningPromise = await new Promise(async (resolve) => {
//         waitOn({
//           resources: [`tcp:${expected}`],
//           delay: 0,
//           tcpTimeout: 500,
//           timeout: 15000,
//         })
//           .then(() => {
//             resolve(true);
//           }) //if service resolves we assume it's up.
//           .catch(() => resolve(false));
//       });
//
//       await inboundProxy.stop();
//       if (!proxyRunningPromise) {
//         fixUrl =
//           fixUrl +
//           'common-issues#error-4-could-not-start-optic-proxy-on-baseurl';
//         throw new Error(`Optic proxy was unable to start on ${expected}`);
//       }
//     },
//   },
// ]);
//
// const tasksToRun = RecommendedCheckSteps;
//
//
//
// tasksToRun
//   .run()
//   .then(async () => {
//     trackUserEvent(
//       ApiCheckCompleted.withProps({
//         inputs: opticTaskToProps(taskName, startConfig!),
//         hasError: false,
//       })
//     );
//
//     cli.log(
//       '\n\n' +
//         fromOptic(
//           colors.green(
//             `Nice work! Optic is setup properly. Now run ${colors.bold(
//               `api run ${taskName}`
//             )}`
//           )
//         )
//     );
//   })
//   .catch(async (err: any) => {
//     cli.log(
//       '\n\n' +
//         fromOptic(
//           colors.red('Optic has detected some issues with your setup')
//         )
//     );
//     cli.log(
//       fromOptic(
//         colors.red(
//           `Configuration Issue Detected-- Solution at ${colors.underline(
//             fixUrl
//           )}`
//         )
//       )
//     );
//
//     trackUserEvent(
//       ApiCheckCompleted.withProps({
//         inputs: opticTaskToProps(taskName, startConfig!),
//         hasError: true,
//         error: err.message,
//       })
//     );
//   });
