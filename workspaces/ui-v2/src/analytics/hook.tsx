import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import Analytics from '@segment/analytics.js-core/build/analytics';
import SegmentIntegration from '@segment/analytics.js-integration-segmentio';
import { OpticUIEvents } from '@useoptic/analytics/lib/optic-ui/OpticUIEvents';
import invariant from 'invariant';
//@ts-ignore
import niceTry from 'nice-try';
import { useAppConfig } from '../optic-components/hooks/config/AppConfiguration';
import { Client } from '@useoptic/cli-client';
const packageJson = require('../../package.json');
const clientId = `local_cli_${packageJson.version}`;

const AnalyticsContext = React.createContext<
  | {
      trackEvent: OpticUIEvents;
    }
  | undefined
>(undefined);

export function useClientAgent() {
  const client = new Client('/api');
  const opticAnalyticsEnabled = true;
  const userPromise = useMemo(
    () =>
      new Promise(async (resolve) => {
        const anonymousId = await niceTry(async () => {
          const response = await client.getIdentity();
          if (response.ok) {
            const { user, anonymousId } = await response.json();
            if (opticAnalyticsEnabled) {
              // window.FS.identify(anonymousId, {
              //   email: user && user.email,
              // });
              // window.analytics.identify(anonymousId);
            }
            return anonymousId;
          }
          return 'anon_id';
        });

        resolve(anonymousId);
      }),
    [opticAnalyticsEnabled]
  );
  return userPromise;
}

export function AnalyticsContextStore({ children }: { children: ReactNode }) {
  const appConfig = useAppConfig();
  const userPromise = useClientAgent();
  const analytics = useRef(new Analytics());

  useEffect(() => {
    if (analytics.current && appConfig.analytics.enabled) {
      analytics.current.use(SegmentIntegration);
      const integrationSettings = {
        'Segment.io': {
          apiKey: '<YOUR SEGMENT WRITE KEY>',
          retryQueue: true,
          addBundledMetadata: true,
        },
      };
      analytics.current.initialize(integrationSettings);
      console.log('segment initialized');
    }
  }, [analytics]);

  const opticUITrackingEvents: React.MutableRefObject<OpticUIEvents> = useRef(
    new OpticUIEvents(async (event) => {
      console.log('track event: ', JSON.stringify(event));
      if (appConfig.analytics.enabled) {
        const clientAgent = await userPromise;
        console.log(clientAgent);
        if (analytics.current) {
          analytics.current.track(event.name, { properties: event.properties });
        }
      }
    })
  );

  return (
    <AnalyticsContext.Provider
      value={{ trackEvent: opticUITrackingEvents.current }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): OpticUIEvents {
  const value = useContext(AnalyticsContext);
  invariant(value, 'useAnalytics could not find AnalyticsContext');
  return value!.trackEvent;
}
