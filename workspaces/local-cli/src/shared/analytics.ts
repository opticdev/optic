/*
  @TODO:
  - Analytics should be abstracted with an interface: track(...)
  - There should be one implementation that does nothing
  - It should be easy to switch between implementations
  - We should not be spawning a new process every time we want to track something. We should be flushing events out of this process and another process can take care of them
 */
// @ts-ignore
import Analytics from 'analytics-node';
import { runScriptByName } from '@useoptic/cli-scripts';
import {
  getCredentials,
  getUserFromCredentials,
} from './authentication-server';
import { IOpticTaskRunnerConfig, IUser } from '@useoptic/cli-config';
import { Client } from '@useoptic/cli-client';
import { TrackingEventBase } from '@useoptic/analytics/lib/interfaces/TrackingEventBase';
import { ensureDaemonStarted } from '@useoptic/cli-server';
import { lockFilePath } from './paths';
import { Config } from '../config';
import { getOrCreateAnonId } from '@useoptic/cli-config/build/opticrc/optic-rc';

const packageJson = require('../../package.json');
const opticVersion = packageJson.version;

const token = 'RvYGmY1bZqlbMukS8pP9DPEifG6CEBEs';
const analytics = new Analytics(token, {
  flushAt: 1,
});

const anonIdPromise: Promise<string> = getOrCreateAnonId();

export async function getUser(): Promise<IUser | null> {
  return new Promise<IUser | null>(async (resolve, reject) => {
    const credentials = await getCredentials();
    if (credentials) {
      const user = await getUserFromCredentials(credentials);
      analytics.identify({
        userId: await anonIdPromise,
        traits: { userId: user.sub, name: user.name, email: user.email },
      });
      resolve(user);
    } else {
      analytics.identify({
        userId: await anonIdPromise,
      });
    }
    resolve(null);
  });
}

export async function trackUserEvent(
  apiName: string,
  event: TrackingEventBase<any>
) {
  const daemonState = await ensureDaemonStarted(
    lockFilePath,
    Config.apiBaseUrl
  );

  const cliServerClient = new Client(
    `http://localhost:${daemonState.port}/api`
  );

  await cliServerClient.postTrackingEvents(apiName, [event]);
}

export function opticTaskToProps(
  task: string,
  config: IOpticTaskRunnerConfig
): any {
  if (config) {
    return {
      task,
      command: config.command,
      'serviceConfig.port': config.serviceConfig.port,
      'serviceConfig.host': config.serviceConfig.host,
      'serviceConfig.protocol': config.serviceConfig.protocol,
      'serviceConfig.basePath': config.serviceConfig.basePath,
      'proxyConfig.port': config.proxyConfig.port,
      'proxyConfig.host': config.proxyConfig.host,
      'proxyConfig.protocol': config.proxyConfig.protocol,
      'proxyConfig.basePath': config.proxyConfig.basePath,
    };
  } else {
    return { task };
  }
}
