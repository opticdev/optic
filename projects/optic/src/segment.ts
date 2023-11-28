import Analytics from '@segment/analytics-node';
const packageJson = require('../package.json');
import { machineIdSync } from 'node-machine-id';

let analytics: Analytics | null = null;
let id: string;
try {
  id = machineIdSync();
} catch (e) {
  id = 'unknown-user';
}
export const initSegment = (key: string | undefined) => {
  const isSegmentDisabled =
    process.env.OPTIC_TELEMETRY_LEVEL === 'off' ||
    process.env.OPTIC_TELEMETRY_LEVEL === 'error' ||
    process.env.OPTIC_ENV === 'staging' ||
    process.env.OPTIC_ENV === 'local';
  if (key && !isSegmentDisabled) {
    analytics = new Analytics({ writeKey: key });
  }
};
export const trackEvent = (
  eventName: string,
  properties?: Object,
  userId?: string
) => {
  const mergedProperties: Object = {
    version: packageJson.version,
    ...(properties ? properties : {}),
  };
  if (analytics) {
    analytics.track({
      event: eventName,
      userId: userId ?? id,
      properties: mergedProperties,
    });
  }
};

export const flushEvents = (): Promise<void> => {
  if (analytics) {
    return analytics!.closeAndFlush({ timeout: 3000 });
  } else {
    return Promise.resolve();
  }
};

export const identify = (email: string) => {
  if (analytics) {
    analytics.identify({
      userId: id,
      traits: {
        email,
      },
    });
  }
};

export const alias = (externalId: string) => {
  if (analytics) {
    analytics.alias({
      userId: externalId,
      previousId: id,
    });
  }
};
