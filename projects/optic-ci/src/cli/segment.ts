import Analytics from 'analytics-node';
const packageJson = require('../../package.json');

let analytics: Analytics | null = null;

export const initSegment = () => {
  if (process.env.SEGMENT_KEY) {
    analytics = new Analytics(process.env.SEGMENT_KEY);
  }
};
export const trackEvent = (
  eventName: string,
  userId: string,
  properties?: Object
) => {
  const mergedProperties: Object = {
    version: packageJson.version,
    ...(properties ? properties : {}),
  };
  if (analytics) {
    analytics.track({
      event: eventName,
      userId,
      properties: mergedProperties,
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
