import { Client } from '@useoptic/cli-client';
import EventEmitter from 'events';
import packageJson from '../package.json';
import {
  AnalyticsEventBus,
  newAnalyticsEventBus,
} from '@useoptic/analytics/lib/eventbus';
import { consistentAnonymousId } from '@useoptic/analytics/lib/consistentAnonymousId';
import { ClientContext } from '@useoptic/analytics/lib/interfaces/TrackingEventBase';
import niceTry from 'nice-try';

const opticVersion = packageJson.version;
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

const analyticsEvents = newAnalyticsEventBus(async (batchId) => {
  const clientAgent = await userPromise;

  const clientContext = {
    clientAgent: clientAgent,
    clientId: clientId,
    clientSessionInstanceId: batchId,
    clientTimestamp: new Date().toISOString(),
  };
  return clientContext;
});

// cli-server consumer
analyticsEvents.listen((event) => {
  console.log('trying to send up to CLI-server');
  // niceTry(async () => client.postTrackingEvents([event]));
});

export function trackUserEvent(event) {
  analyticsEvents.emit(event);
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
