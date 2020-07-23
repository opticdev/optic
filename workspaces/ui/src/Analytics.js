import { Client } from '@useoptic/cli-client';
import EventEmitter from 'events';
import packageJson from '../package.json';
const opticVersion = packageJson.version;

let isAnalyticsEnabled = window.opticAnalyticsEnabled;

const readyPromise = new Promise(async (resolve) => {
  const client = new Client('/api');
  if (isAnalyticsEnabled) {
    const response = await client.getIdentity();
    // debugger;
    if (response.ok) {
      const { user } = await response.json();
      window.FS.identify(user.sub, {
        displayName: user.name,
        email: user.email,
      });
      window.analytics.identify(user.sub, {
        name: user.name,
        email: user.email,
      });
      window.Intercom('update', { name: user.name, email: user.email });
    }
    resolve();
  } else {
    console.warn('Analytics is disabled');
    try {
      window.FS.shutdown();
    } catch (e) {}
    resolve();
  }
});

export async function touchAnalytics() {
  await readyPromise;
  console.log('analytics loaded');
}

class EventTrackingEmitter extends EventEmitter {}

export const trackEmitter = new EventTrackingEmitter();

export async function track(event, props) {
  await readyPromise;
  if (isAnalyticsEnabled) {
    const allProps = { ...props, opticVersion };
    window.analytics.track(event, allProps);
    window.FS.event(event, allProps);
  }
  trackEmitter.emit('event', event, props || {});
}
