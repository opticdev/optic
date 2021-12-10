import Analytics from 'analytics-node';

let analytics: Analytics | null = null;

export const initSegment = () => {
  analytics = new Analytics('mJ6wOwH8Zhj7ZiR44pCDIV6yHejD6mVd');
};
export const trackEvent = (eventName: string, properties?: any) => {
  if (analytics) {
    analytics.track({
      event: eventName,
      properties,
    });
  }
};
