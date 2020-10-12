import {
  IOpticTask,
  IOpticTaskRunnerConfig,
  Modes,
} from '@useoptic/cli-config';
import url from 'url';
import waitOn from 'wait-on';

export async function awaitTaskUp(
  mode: Modes,
  runnerConfig: IOpticTaskRunnerConfig
): Promise<void> {
  const proxyStartedPromise = (() => {
    const proxyConfig = runnerConfig.proxyConfig;
    const proxyPort = proxyConfig.port;
    const proxyHost = proxyConfig.host;

    const expected = `${proxyHost}:${proxyPort}`;

    return new Promise((resolve) => {
      waitOn({
        resources: [`tcp:${expected}`],
        delay: 0,
        tcpTimeout: 500,
        timeout: 60000,
      })
        .then(() => {
          resolve(true);
        }) //if service resolves we assume it's up.
        .catch(() => resolve(false));
    });
  })();

  const serviceStartedPromise = (() => {
    const serviceConfig = runnerConfig.serviceConfig;
    const servicePort = serviceConfig.port;

    return new Promise((resolve) => {
      waitOn({
        resources: [`tcp:${servicePort}`],
        delay: 0,
        tcpTimeout: 500,
        timeout: 60000,
      })
        .then(() => {
          resolve(true);
        }) //if service resolves we assume it's up.
        .catch(() => resolve(false));
    });
  })();

  if (mode === Modes.Recommended) {
    await Promise.all([serviceStartedPromise, proxyStartedPromise]);
  }

  if (mode === Modes.Manual) {
    await Promise.all([proxyStartedPromise]);
  }
}
