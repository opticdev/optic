import { Client } from '@useoptic/cli-client';
import packageJson from '../package.json';
import { newAnalyticsEventBus } from '@useoptic/analytics/lib/eventbus';
import { consistentAnonymousId } from '@useoptic/analytics/lib/consistentAnonymousId';
import niceTry from 'nice-try';

const clientId = `local_cli_${packageJson.version}`;

let isAnalyticsEnabled = window.opticAnalyticsEnabled;
if (!isAnalyticsEnabled) {
  window.FS && window.FS.shutdown();
}
const client = new Client('/api');

const userPromise = new Promise(async (resolve) => {
  const userToken = await niceTry(async () => {
    const response = await client.getIdentity();
    if (response.ok) {
      const { user } = await response.json();
      if (isAnalyticsEnabled) {
        window.FS.identify(user.sub, {
          email: user.email,
        });
        window.Intercom('update', { user_id: user.sub, email: user.email });
      }
      resolve(user.sub);
    }
  });

  resolve(userToken || consistentAnonymousId);
});

export const analyticsEvents = newAnalyticsEventBus(async (batchId) => {
  const clientAgent = await userPromise;

  const clientContext = {
    clientAgent: clientAgent,
    clientId: clientId,
    clientSessionInstanceId: batchId,
    clientTimestamp: new Date().toISOString(),
  };
  return clientContext;
});

analyticsEvents.eventEmitter.setMaxListeners(1);
//forward analytics to central CLI server bus
analyticsEvents.listen((event) => {
  try {
    client.postTrackingEvents([event]);
  } catch (e) {}
});

export function trackUserEvent(event) {
  console.log('hello world');
  analyticsEvents.emit(event);
}

export async function track(event, props) {
  console.group(`Deprecated Event Called ${event}`);
  console.groupEnd();
}

// class EventTrackingEmitter extends EventEmitter {}
//
// export const trackEmitter = new EventTrackingEmitter();
//
// export async function track(event, props) {
//   await readyPromise;
//   if (isAnalyticsEnabled) {
//     const allProps = { ...props, opticVersion };
//     window.analytics.track(event, allProps);
//     window.FS.event(event, allProps);
//   }
//   trackEmitter.emit('event', event, props || {});
// }
