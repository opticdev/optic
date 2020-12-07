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
const packageJson = require('../package.json');

const clientId = `local_cli_${packageJson.version}`;

//event bus for tracking events
const analyticsEvents: AnalyticsEventBus = newAnalyticsEventBus(
  async (batchId: string) => {
    const user = await getCredentials();
    const decodedSub = niceTry(() => jwtDecode(user!.token).sub);
    const clientAgent = decodedSub ? decodedSub : consistentAnonymousId;

    const clientContext: ClientContext = {
      clientAgent: clientAgent,
      clientId: clientId,
      clientSessionInstanceId: batchId,
      clientTimestamp: new Date().toISOString(),
    };
    return clientContext;
  }
);

export function track(...events: TrackingEventBase<any>[]): void {
  analyticsEvents.emit(...events);
}

export const analyticsEventEmitter = analyticsEvents.eventEmitter;

const inDevelopment = process.env.OPTIC_DEVELOPMENT === 'yes';

// segment io sink
const token = 'RvYGmY1bZqlbMukS8pP9DPEifG6CEBEs';
const analytics = new Analytics(token);

analyticsEvents.listen((event) => {
  if (inDevelopment) return;
  const properties = {
    ...event.data,
    ...event.context,
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
