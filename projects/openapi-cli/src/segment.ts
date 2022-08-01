import Analytics from 'analytics-node';
import { machineIdSync } from 'node-machine-id';

let analytics: {
  segment: Analytics;
  anonymousId: string;
  app: { name: string; version: string };
  runId: string;
} | null = null;

export const initSegment = ({
  key,
  version,
  name,
  runId,
}: {
  key: string;
  version: string;
  name: string;
  runId: string;
}) => {
  let segment = new Analytics(key);
  let anonymousId;
  try {
    anonymousId = machineIdSync();
  } catch (err) {
    console.warn('Could not initialise segment even tracking (non critical): ');
  }

  if (segment && anonymousId) {
    analytics = { segment, anonymousId, app: { version, name }, runId };
  }
};

export const trackEvent = (eventName: string, properties?: any) => {
  if (analytics) {
    analytics.segment.track({
      event: eventName,
      anonymousId: analytics.anonymousId,
      properties,
      context: {
        app: analytics.app,
        runId: analytics.runId,
      },
    });
  }
};

export const flushEvents = (): Promise<void> => {
  if (analytics) {
    return new Promise((resolve, reject) => {
      analytics!.segment.flush((err, batch) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } else {
    return Promise.resolve();
  }
};
