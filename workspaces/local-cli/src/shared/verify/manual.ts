import {
  IOpticTaskAliased,
  IOpticTaskRunnerConfig,
} from '@useoptic/cli-config';
//@ts-ignore
import Listr from 'listr';
//@ts-ignore
import url from 'url';
import {
  CommandSession,
  HttpToolkitCapturingProxy,
} from '@useoptic/cli-shared';
import colors from 'colors';
import waitOn from 'wait-on';
import {
  ApiProcessStartsOnAssignedHost,
  ApiProcessStartsOnAssignedPort,
  CheckAssertions,
  CommandIsLongRunning,
  failingAssertions,
  ProxyCanStartAtInboundUrl,
  ProxyTargetUrlResolves,
} from './assertions';
import assert from 'assert';
import { buildQueryStringParser } from '@useoptic/cli-shared/build/query/build-query-string-parser';
import {
  getAssertionsFromCommandSession,
  getAssertionsFromProxyStartPromise,
} from './recommended';

export async function verifyManual(
  task: IOpticTaskAliased,
  startConfig: IOpticTaskRunnerConfig
): Promise<{
  failing: CheckAssertions[];
  assertions: {};
  passedAll: boolean;
}> {
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

  ////////////////////////////////////////////////////////

  console.log(
    `\n\nGiven this ${colors.bold('targetUrl')}: ${colors.gray(
      task.targetUrl!
    )}`
  );

  let isTargetResolvable: ProxyTargetUrlResolves | undefined;

  const TargetCheckSteps = new Listr([
    {
      title: `Is resolvable from localhost`,
      enabled: () => !Boolean(task.command),
      task: async () => {
        const results = await getAssertionsFromTargetExistsPromise(startConfig);
        isTargetResolvable = results.proxyTargetUrlResolves;
        assert(
          results.proxyTargetUrlResolves.passed,
          'hostname could not be resolved'
        );
      },
    },
    {
      title: `Is resolvable after command ${colors.gray(
        task.command?.toString() || ''
      )}`,
      enabled: () => Boolean(task.command),
      task: async () => {
        const commandSessionPromise = await getAssertionsFromCommandSession(
          task,
          startConfig
        );

        isTargetResolvable = commandSessionPromise.proxyTargetUrlResolves;

        assert(
          commandSessionPromise.proxyTargetUrlResolves!.passed,
          'hostname could not be resolved'
        );
      },
    },
  ]);

  await new Promise((resolve) => {
    TargetCheckSteps.run().then(resolve).catch(resolve);
  });

  const assertions = {
    ...(await proxyStartPromise),
    isTargetResolvable: isTargetResolvable!,
  };
  const failing = failingAssertions(Object.values(assertions));
  return {
    assertions,
    failing,
    passedAll: failing.length === 0,
  };
}

export async function getAssertionsFromTargetExistsPromise(
  startConfig: IOpticTaskRunnerConfig
) {
  const serviceConfig = startConfig!.serviceConfig;
  const servicePort = serviceConfig.port;
  const serviceHost = serviceConfig.host;

  const target = `${serviceHost}:${servicePort}`;

  const targetRunningPromise: boolean = await new Promise(async (resolve) => {
    waitOn({
      resources: [`tcp:${target}`],
      delay: 0,
      tcpTimeout: 500,
      timeout: 10000,
    })
      .then(() => {
        resolve(true);
      }) //if service resolves we assume it's up.
      .catch(() => resolve(false));
  });

  const proxyTargetUrlResolves: ProxyTargetUrlResolves = {
    passed: targetRunningPromise,
    targetHostname: target,
  };
  return {
    proxyTargetUrlResolves,
  };
}
