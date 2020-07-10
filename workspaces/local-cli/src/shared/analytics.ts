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

const packageJson = require('../../package.json');
const opticVersion = packageJson.version;

const token = 'RvYGmY1bZqlbMukS8pP9DPEifG6CEBEs';
const analytics = new Analytics(token, {
  flushAt: 1,
});

export async function getUser(): Promise<IUser | null> {
  return new Promise<IUser | null>(async (resolve, reject) => {
    const credentials = await getCredentials();
    if (credentials) {
      const user = await getUserFromCredentials(credentials);
      analytics.identify({
        userId: user.sub,
        traits: { name: user.name, email: user.email },
      });
      resolve(user);
    }
    resolve(null);
  });
}

export async function track(event: string, properties: any = {}) {
  await new Promise((resolve, reject) => {
    getUser().then((user) => {
      if (user) {
        analytics.track({ userId: user.sub, event, properties }, resolve);
      } else {
        analytics.track({ anonymousId: 'anon', event, properties }, resolve);
      }
    });
  });
}

// make me spawn a process so main thread can end
export function trackAndSpawn(event: string, properties: any = {}) {
  getUser().then((user) => {
    runScriptByName(
      'emit-analytics',
      token,
      JSON.stringify({
        userId: user ? user.sub : 'anon',
        event,
        properties: {
          ...properties,
          opticVersion,
        },
      })
    );
  });
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
