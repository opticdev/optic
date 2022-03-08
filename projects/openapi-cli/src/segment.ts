import Analytics from 'analytics-node';

let analytics: Analytics | null = null;

export const initSegment = ({ key }: { key: string }) => {
  analytics = new Analytics(key);
};
export const trackEvent = (
  eventName: string,
  userId: string,
  properties?: any
) => {
  if (analytics) {
    analytics.track({
      event: eventName,
      userId,
      properties,
    });
  }
};

export const flushEvents = (): Promise<void> => {
  if (analytics) {
    return new Promise((resolve, reject) => {
      analytics!.flush((err, batch) => {
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
