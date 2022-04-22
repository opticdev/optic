import Analytics from 'analytics-node';
import { machineIdSync } from 'node-machine-id';

let analytics: {
  segment: Analytics;
  anonymousId: string;
} | null = null;

export const initSegment = ({ key }: { key: string }) => {
  let segment = new Analytics(key);
  let anonymousId;
  try {
    anonymousId = machineIdSync();
  } catch (err) {
    console.warn('Could not initialise segment even tracking (non critical): ');
  }

  if (segment && anonymousId) {
    analytics = { segment, anonymousId };
  }
};

export const trackEvent = (
  eventName: string,
  userId: string,
  properties?: any
) => {
  if (analytics) {
    analytics.segment.track({
      event: eventName,
      anonymousId: analytics.anonymousId,
      userId,
      properties,
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
