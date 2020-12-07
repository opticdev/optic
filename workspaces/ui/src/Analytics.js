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
  const anonymousId = await niceTry(async () => {
    const response = await client.getIdentity();
    if (response.ok) {
      const { user, anonymousId } = await response.json();
      if (isAnalyticsEnabled) {
        window.FS.identify(anonymousId, {
          email: user && user.email,
        });
        window.Intercom('update', {
          user_id: anonymousId,
          id: user && user.sub,
          email: user && user.email,
        });
      }
      return anonymousId;
    }

    return 'anon_id';
  });

  resolve(anonymousId);
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

//forward analytics to central CLI server bus
analyticsEvents.listen((event) => {
  if (isAnalyticsEnabled) {
    try {
      if (window.FS) {
        window.FS.event(event.type, { ...event.data, ...event.context });
      }
      client.postTrackingEvents([event]);
    } catch (e) {}
  }
});

export function trackUserEvent(event) {
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
