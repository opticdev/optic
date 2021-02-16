import { newAnalyticsEventBus } from '@useoptic/analytics/lib/eventbus';
//@ts-ignore
import Analytics from 'analytics-node';
//@ts-ignore
import jwtDecode from 'jwt-decode';
import { consistentAnonymousId } from '@useoptic/analytics/lib/consistentAnonymousId';
//@ts-ignore
import niceTry from 'nice-try';
import {
  ClientContext,
  TrackingEventBase,
} from '@useoptic/analytics/lib/interfaces/TrackingEventBase';
import { AnalyticsEventBus } from '@useoptic/analytics/lib/eventbus';
import path from 'path';
import os from 'os';
import { IUserCredentials } from '@useoptic/cli-config';
import fs from 'fs-extra';
import {getOrCreateAnonId} from "@useoptic/cli-config/build/opticrc/optic-rc";
const packageJson = require('../package.json');

const clientId = `local_cli_${packageJson.version}`;
const platform = os.platform();
const arch = os.arch();
const release = os.release();

//event bus for tracking events
export const analyticsEvents: AnalyticsEventBus = newAnalyticsEventBus(
  async (batchId: string) => {
    const clientAgent = await getOrCreateAnonId()
    const clientContext: ClientContext = {
      clientAgent: clientAgent,
      clientId: clientId,
      platform: platform,
      arch: arch,
      release: release,
      clientSessionInstanceId: batchId,
      clientTimestamp: new Date().toISOString(),
      apiName: '',
    };
    return clientContext;
  }
);

export function track(...events: TrackingEventBase<any>[]): void {
  analyticsEvents.emit(...events);
}

export function trackWithApiName(apiName: string) {
  return (events: TrackingEventBase<any>[]) => {
    analyticsEvents.emit(
      ...events.map((i) => {
        return { ...i, context: { ...i.context }, data: {...i.data, apiName} };
      })
    );
  };
}

const inDevelopment = process.env.OPTIC_DEVELOPMENT === 'yes';

// segment io sink
const token = 'RvYGmY1bZqlbMukS8pP9DPEifG6CEBEs';
const analytics = new Analytics(token);

analyticsEvents.listen((event) => {
  if (inDevelopment) return;
  const properties = {
    ...event.context,
    ...event.data,
  };
  analytics.track({
    userId: event.context.clientAgent,
    event: event.type,
    properties,
  });
});

// lookup credentials
const opticrcPath = path.resolve(os.homedir(), '.opticrc');
export async function getCredentials(): Promise<IUserCredentials | null> {
  try {
    const storage = await fs.readJSON(opticrcPath);
    if (storage.idToken) {
      return { token: storage.idToken };
    }
    return null;
  } catch (e) {
    return null;
  }
}
