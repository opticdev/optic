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
} from '@useoptic/cli-config';
import {
  HttpToolkitCapturingProxy,
  CommandSession,
} from '@useoptic/cli-shared';
import waitOn from 'wait-on';
import { opticTaskToProps, track, trackAndSpawn } from './analytics';
import { fromOptic } from '@useoptic/cli-shared';
import url from 'url';
import { buildQueryStringParser } from '@useoptic/cli-shared/build/query/build-query-string-parser';

export function verifyTask(cli: Command, taskName: string): void {
  cli.log(fromOptic(colors.bold(`Testing task '${taskName}' `)));
  cli.log('\n' + colors.underline('Assertions'));

  let foundTask: IOpticTask;
  let startConfig: IOpticTaskRunnerConfig;

  let fixUrl = 'https://docs.useoptic.com/faqs-and-troubleshooting/';

  const tasks = new Listr([
    {
      title: `Task '${taskName}' exists`,
      task: async () => {
        const taskExists = await niceTry(async () => {
          const paths = await getPathsRelativeToConfig();
          const config = await readApiConfig(paths.configPath);
          const task = config.tasks[taskName];
          foundTask = task;
          if (foundTask) {
            startConfig = await TaskToStartConfig(task);
          }
          return Boolean(task);
        });

        if (!taskExists) {
          fixUrl = fixUrl + 'common-issues#error-1-task-does-not-exist';
          throw new Error(`Task ${taskName} not found`);
        }
      },
    },
    {
      title: `Task '${taskName} has a 'command' and / or a 'targetUrl'`,
      task: async () => {
        if (!foundTask.command && !foundTask.targetUrl && !foundTask.proxy) {
          // TODO: add fix URL
          throw new Error(
            `A command and / or a targetUrl is required for Optic to know where to forward traffic`
          );
        }
      },
    },
    {
      title: `The command provided starts your API on the ${colors.bold(
        '$OPTIC_API_PORT'
      )}`,
      enabled: () => startConfig && !!startConfig.command,
      task: async (cxt: any, task: any) => {
        const commandSession = new CommandSession();

        const serviceConfig = startConfig.serviceConfig;
        const servicePort = serviceConfig.port;
        const serviceHost = serviceConfig.host;
        const opticServiceConfig = {
          OPTIC_API_PORT: servicePort.toString(),
          OPTIC_API_HOST: serviceHost.toString(),
        };

        const expected = `${serviceConfig.host}:${serviceConfig.port}`;

        task.title = `Your command, ${colors.bold.blue(
          startConfig.command!
        )}, starts your API on the host and port Optic assigns it ${colors.bold(
          expected
        )}`;

        await commandSession.start(
          {
            command: startConfig.command!,
            // @ts-ignore
            environmentVariables: {
              ...process.env,
              ...opticServiceConfig,
            },
          },
          true
        );

        let status = 'running';
        let serviceRunning = false;

        const commandStoppedPromise = new Promise((resolve) => {
          commandSession.events.on('stopped', ({ state }) => {
            status = state;
            resolve();
          });
        });

        const serviceRunningPromise = new Promise(async (resolve) => {
          waitOn({
            resources: [`tcp:${expected}`],
            delay: 0,
            tcpTimeout: 500,
            timeout: 25000,
          })
            .then(() => {
              serviceRunning = true;
              resolve(true);
            }) //if service resolves we assume it's up.
            .catch(() => resolve(false));
        });

        const finished = await Promise.race([
          commandStoppedPromise,
          serviceRunningPromise,
        ]);

        commandSession.stop();

        if (status !== 'running') {
          fixUrl =
            fixUrl +
            'common-issues#error-2-your-command-exited-early-or-was-not-long-running';
          throw new Error('Your command exited early or was not long-running.');
        }

        if (!serviceRunning) {
          fixUrl =
            fixUrl +
            'common-issues#error-3-your-api-did-not-start-on-the-expected-port';
          throw new Error(
            `Your API was not started on the expected port ${expected}`
          );
        }
      },
    },
    {
      title: `Optic can start`,
      task: async (cxt: any, task: any) => {
        const proxyConfig = startConfig.proxyConfig;
        const proxyPort = proxyConfig.port;
        const proxyHost = proxyConfig.host;

        const serviceConfig = startConfig.serviceConfig;
        const servicePort = serviceConfig.port;
        const serviceHost = serviceConfig.host;

        const expected = `${proxyHost}:${proxyPort}`;

        task.title = `Optic proxy can start on ${expected}`;

        const inboundProxy = new HttpToolkitCapturingProxy();

        const target = url.format({
          hostname: serviceHost,
          port: servicePort,
          protocol: serviceConfig.protocol,
        });

        await inboundProxy.start({
          flags: {
            includeTextBody: true,
            includeJsonBody: true,
            includeShapeHash: true,
            includeQueryString: true,
          },
          host: proxyConfig.host,
          proxyTarget:
            process.env.OPTIC_ENABLE_TRANSPARENT_PROXY === 'yes'
              ? undefined
              : target,
          proxyPort: proxyConfig.port,
          queryParser: buildQueryStringParser(),
        });

        const proxyRunningPromise = await new Promise(async (resolve) => {
          waitOn({
            resources: [`tcp:${expected}`],
            delay: 0,
            tcpTimeout: 500,
            timeout: 15000,
          })
            .then(() => {
              resolve(true);
            }) //if service resolves we assume it's up.
            .catch(() => resolve(false));
        });

        await inboundProxy.stop();
        if (!proxyRunningPromise) {
          fixUrl =
            fixUrl +
            'common-issues#error-4-could-not-start-optic-proxy-on-baseurl';
          throw new Error(`Optic proxy was unable to start on ${expected}`);
        }
      },
    },
  ]);

  tasks
    .run()
    .then(async () => {
      await trackAndSpawn('API Check', {
        ...opticTaskToProps(taskName, startConfig),
        hasError: false,
      });
      cli.log(
        '\n\n' +
          fromOptic(
            colors.green(
              `Nice work! Optic is setup properly. Now run ${colors.bold(
                `api run ${taskName}`
              )}`
            )
          )
      );
    })
    .catch(async (err: any) => {
      cli.log(
        '\n\n' +
          fromOptic(
            colors.red('Optic has detected some issues with your setup')
          )
      );
      cli.log(
        fromOptic(
          colors.red(
            `Configuration Issue Detected-- Solution at ${colors.underline(
              fixUrl
            )}`
          )
        )
      );

      await trackAndSpawn('API Check', {
        ...opticTaskToProps(taskName, startConfig),
        hasError: true,
        error: err.message,
      });
    });
}
