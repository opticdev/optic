// @ts-ignore
import * as Analytics from 'analytics-node';
import { getCredentials, getUserFromCredentials } from './authentication-server';
import { IUser } from '@useoptic/cli-config';

const analytics = new Analytics('RvYGmY1bZqlbMukS8pP9DPEifG6CEBEs', { flushAt: 1 });


const getUserPromise = new Promise<IUser | null>(async (resolve, reject) => {
  const credentials = await getCredentials();
  if (credentials) {
    const user = await getUserFromCredentials(credentials);
    analytics.identify({ userId: user.sub, traits: { name: user.name, email: user.email } });
    resolve(user);
  }
  resolve(null);
});


export async function track(event: string, properties: any = {}) {
  await new Promise(((resolve, reject) => {
    getUserPromise.then(user => {
      if (user) {
        analytics.track({ userId: user.sub, event, properties }, resolve);
      } else {
        analytics.track({ anonymousId: 'anon', event, properties }, resolve);
      }
    });
  }));
}
