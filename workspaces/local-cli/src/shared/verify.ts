//@ts-ignore
import * as Listr from 'listr';
import Command from '@oclif/command';
import * as colors from 'colors';
//@ts-ignore
import * as niceTry from 'nice-try';
import { fromOptic } from './conversation';
import {
  getPathsRelativeToConfig,
  IOpticTaskRunnerConfig,
  readApiConfig,
  TaskToStartConfig,
} from '@useoptic/cli-config';
import { CommandSession } from './command-session';
import * as waitOn from 'wait-on';
import { HttpToolkitCapturingProxy } from '@useoptic/proxy';
import { track, trackAndSpawn } from './analytics';

export function verifyTask(cli: Command, taskName: string): void {
  cli.log(fromOptic(colors.bold(`Testing task '${taskName}' `)));
  cli.log('\n' + colors.underline('Assertions'));

  let foundTask;
  let startConfig: IOpticTaskRunnerConfig;

  let fixUrl = 'https://docs.useoptic.com/';

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
            startConfig = await TaskToStartConfig(task, 'mock-capture');
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
      title: `The command provided starts your API on the ${colors.bold(
        '$OPTIC_API_PORT'
      )}`,
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

        const target = require('url').format({
          hostname: serviceHost,
          port: servicePort,
          protocol: serviceConfig.protocol,
        });

        await inboundProxy.start({
          flags: {
            chrome: process.env.OPTIC_ENABLE_CHROME === 'yes',
            includeTextBody: true,
            includeJsonBody: true,
            includeShapeHash: true,
          },
          host: proxyConfig.host,
          proxyTarget:
            process.env.OPTIC_ENABLE_TRANSPARENT_PROXY === 'yes'
              ? undefined
              : target,
          proxyPort: proxyConfig.port,
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
      await trackAndSpawn('API Check', { startConfig, hasError: false });
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
        startConfig,
        hasError: true,
        error: err.message,
      });
      process.exit(0);
    });
}
