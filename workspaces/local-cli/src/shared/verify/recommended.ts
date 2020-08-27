import {
  IOpticTaskAliased,
  IOpticTaskRunnerConfig,
} from '@useoptic/cli-config';
//@ts-ignore
import Listr from 'listr';
import url from 'url';
import {
  CommandSession,
  HttpToolkitCapturingProxy,
} from '@useoptic/cli-shared';
import colors from 'colors';
import waitOn from 'wait-on';

import assert from 'assert';
import { buildQueryStringParser } from '@useoptic/cli-shared/build/query/build-query-string-parser';
import exp from 'constants';
import {
  ApiProcessStartsOnAssignedHost,
  ApiProcessStartsOnAssignedPort,
  CheckAssertions,
  CommandIsLongRunning,
  ProxyCanStartAtInboundUrl,
  ProxyTargetUrlResolves,
} from '@useoptic/analytics/lib/interfaces/ApiCheck';
import { failingAssertions } from './assertions';

export async function verifyRecommended(
  task: IOpticTaskAliased,
  startConfig: IOpticTaskRunnerConfig
): Promise<{
  failing: CheckAssertions[];
  assertions: {
    proxyCanStartAtInboundUrl: ProxyCanStartAtInboundUrl;
    startOnHostAssertion: ApiProcessStartsOnAssignedHost;
    startOnPortAssertion: ApiProcessStartsOnAssignedPort;
    longRunningAssertion: CommandIsLongRunning;
  };
  passedAll: boolean;
}> {
  const commandSessionPromise = getAssertionsFromCommandSession(
    task,
    startConfig
  );

  console.log(
    `\n\nYour ${colors.bold('command')}: ${colors.gray(startConfig.command!)}`
  );

  const CommandCheckSteps = new Listr([
    {
      title: `Starts a long running process (your API)`,
      task: async (cxt: any, task: any) => {
        const results = await commandSessionPromise;
        assert(
          results.longRunningAssertion.passed,
          'Your command exited early'
        );
      },
    },
    {
      title: `On the host Optic assigns it ${colors.bold(
        '$OPTIC_API_HOST'
      )} (current: ${colors.bold(startConfig.serviceConfig.host)})`,
      task: async () => {
        const results = await commandSessionPromise;
        assert(
          results.startOnHostAssertion.passed,
          `Your command did not start the API on ${colors.bold(
            startConfig.serviceConfig.host
          )}`
        );
      },
    },
    {
      title: `On the port Optic assigns it ${colors.bold(
        '$OPTIC_API_PORT'
      )} (current: ${colors.bold(startConfig.serviceConfig.port.toString())})`,
      task: async () => {
        const results = await commandSessionPromise;
        assert(
          results.startOnPortAssertion.passed,
          `Your command did not start the API on ${colors.bold(
            '$OPTIC_API_PORT'
          )} after 25 seconds`
        );
      },
    },
  ]);

  await new Promise((resolve) => {
    CommandCheckSteps.run().then(resolve).catch(resolve);
  });

  const proxyStartPromise = getAssertionsFromProxyStartPromise(startConfig);

  console.log(
    `\n\nGiven this ${colors.bold('inboundUrl')}: ${colors.gray(
      task.inboundUrl!
    )}`
  );

  const ProxyCheckSteps = new Listr([
    {
      title: `Optic proxy is able to start its proxy here ${colors.bold(
        `${
          startConfig.proxyConfig.host
        }:${startConfig.proxyConfig.port.toString()}`
      )}`,
      task: async (cxt: any, task: any) => {
        const results = await proxyStartPromise;
        assert(
          results.proxyCanStartAtInboundUrl.passed,
          'Optic could not start here: ' +
            results.proxyCanStartAtInboundUrl.hostname
        );
      },
    },
  ]);

  await new Promise((resolve) => {
    ProxyCheckSteps.run().then(resolve).catch(resolve);
  });

  const assertions = {
    ...(await proxyStartPromise),
    ...(await commandSessionPromise),
  };
  const failing = failingAssertions([
    assertions.longRunningAssertion,
    assertions.startOnHostAssertion,
    assertions.startOnPortAssertion,
    assertions.proxyCanStartAtInboundUrl,
  ]);

  return {
    assertions,
    failing,
    passedAll: failing.length === 0,
  };
}

export async function getAssertionsFromCommandSession(
  task: IOpticTaskAliased,
  startConfig: IOpticTaskRunnerConfig
): Promise<{
  proxyTargetUrlResolves: ProxyTargetUrlResolves;
  startOnHostAssertion: ApiProcessStartsOnAssignedHost;
  startOnPortAssertion: ApiProcessStartsOnAssignedPort;
  longRunningAssertion: CommandIsLongRunning;
}> {
  const commandSession = new CommandSession();

  const serviceConfig = startConfig!.serviceConfig;
  const servicePort = serviceConfig.port;
  const serviceHost = serviceConfig.host;
  const opticServiceConfig = {
    OPTIC_API_PORT: servicePort.toString(),
    OPTIC_API_HOST: serviceHost.toString(),
  };

  const expected = `${serviceConfig.host}:${serviceConfig.port}`;

  await commandSession.start(
    {
      command: startConfig!.command!,
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

  /////

  commandSession.stop();

  //assertions
  const startOnHostAssertion: ApiProcessStartsOnAssignedHost = {
    passed: serviceRunning || serviceHost === 'localhost',
    expectedHost: serviceConfig.host,
  };
  const startOnPortAssertion: ApiProcessStartsOnAssignedPort = {
    passed: serviceRunning,
    expectedPort: serviceConfig.port.toString(),
  };
  const longRunningAssertion: CommandIsLongRunning = {
    passed: status === 'running',
    command: startConfig.command!,
  };

  const proxyTargetUrlResolves: ProxyTargetUrlResolves = {
    passed: task.targetUrl ? serviceRunning : false,
    targetHostname: expected,
  };

  return {
    startOnHostAssertion,
    startOnPortAssertion,
    longRunningAssertion,
    proxyTargetUrlResolves: proxyTargetUrlResolves,
  };
}

export async function getAssertionsFromProxyStartPromise(
  startConfig: IOpticTaskRunnerConfig
) {
  const proxyConfig = startConfig!.proxyConfig;
  const proxyPort = proxyConfig.port;
  const proxyHost = proxyConfig.host;

  const serviceConfig = startConfig!.serviceConfig;
  const servicePort = serviceConfig.port;
  const serviceHost = serviceConfig.host;

  const expected = `${proxyHost}:${proxyPort}`;

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
      process.env.OPTIC_ENABLE_TRANSPARENT_PROXY === 'yes' ? undefined : target,
    proxyPort: proxyConfig.port,
    queryParser: buildQueryStringParser(),
  });

  const proxyRunningPromise: boolean = await new Promise(async (resolve) => {
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

  const proxyCanStartAtInboundUrl: ProxyCanStartAtInboundUrl = {
    passed: proxyRunningPromise,
    hostname: expected,
  };
  return {
    proxyCanStartAtInboundUrl,
  };
}
