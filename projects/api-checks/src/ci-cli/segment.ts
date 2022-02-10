import Analytics from 'analytics-node';

let analytics: Analytics | null = null;

export const initSegment = () => {
  if (process.env.SEGMENT_KEY) {
    analytics = new Analytics(process.env.SEGMENT_KEY);
  }
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
