import os from 'os';
import { newAnalyticsEventBus } from '@useoptic/analytics/lib/eventbus';
import Analytics from 'analytics-node';
import {
  ClientContext,
  TrackingEventBase,
} from '@useoptic/analytics/lib/interfaces/TrackingEventBase';
import { AnalyticsEventBus } from '@useoptic/analytics/lib/eventbus';
import {
  getOrCreateAnonId,
  getOrCreateSource,
} from '@useoptic/cli-config/build/opticrc/optic-rc';

const packageJson = require('../package.json');

const clientId = `local_cli_${packageJson.version}`;
const platform = os.platform();
const arch = os.arch();
const release = os.release();

//event bus for tracking events
export const analyticsEvents: AnalyticsEventBus = newAnalyticsEventBus(
  async (batchId: string) => {
    const clientAgent = await getOrCreateAnonId();
    const source = await getOrCreateSource();
    const clientContext: ClientContext = {
      clientAgent: clientAgent,
      clientId: clientId,
      platform: platform,
      arch: arch,
      release: release,
      clientSessionInstanceId: batchId,
      clientTimestamp: new Date().toISOString(),
      apiName: '',
      source,
    };
    return clientContext;
  }
);

export function track(events: TrackingEventBase<any>[]): void {
  analyticsEvents.emit(...events);
}

export function trackWithApiName(apiName: string) {
  return (events: TrackingEventBase<any>[]) => {
    analyticsEvents.emit(
      ...events.map((i) => {
        return {
          ...i,
          context: { ...i.context },
          data: { ...i.data, apiName },
        };
      })
    );
  };
}

const inDevelopment = process.env.OPTIC_DEVELOPMENT === 'yes';

// segment io sink
const token = 'RvYGmY1bZqlbMukS8pP9DPEifG6CEBEs';
const analytics = new Analytics(token);
// Identify user
getOrCreateAnonId().then((anonymousId) =>
  analytics.identify({
    userId: anonymousId,
  })
);

analyticsEvents.listen((event) => {
  if (inDevelopment) return;
  const properties = {
    uiVariant: 'localCli',
    ...event.context,
    ...event.data,
  };
  analytics.track({
    userId: event.context.clientAgent,
    event: event.type,
    properties,
  });
});
