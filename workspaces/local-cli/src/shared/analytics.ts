// @ts-ignore
import * as Analytics from 'analytics-node';
import { basePath } from '@useoptic/cli-scripts';
import {
  getCredentials,
  getUserFromCredentials,
} from './authentication-server';
import { IUser } from '@useoptic/cli-config';
import * as cp from 'child_process';
import * as path from 'path';

const token = 'RvYGmY1bZqlbMukS8pP9DPEifG6CEBEs';
const analytics = new Analytics(token, {
  flushAt: 1,
});

export async function getUser() {
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
  new Promise((resolve, reject) => {
    getUser().then((user) => {
      const modulePath = path.join(basePath, 'emit-analytics');
      const child = cp.fork(
        modulePath,
        [
          token,
          JSON.stringify({
            userId: user ? user.sub : 'anon',
            event,
            properties,
          }),
        ],
        { detached: true, stdio: 'ignore' }
      );
    });
  });
}
