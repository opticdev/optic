import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Analytics from '@segment/analytics.js-core/build/analytics';
//@ts-ignore
import SegmentIntegration from '@segment/analytics.js-integration-segmentio';
import { OpticUIEvents } from '@useoptic/analytics/lib/optic-ui/OpticUIEvents';
import invariant from 'invariant';
//@ts-ignore
import niceTry from 'nice-try';
import { useAppConfig } from '../optic-components/hooks/config/AppConfiguration';
import { Client } from '@useoptic/cli-client';
import * as Sentry from '@sentry/react';

const packageJson = require('../../package.json');
const clientId = `local_cli_${packageJson.version}`;

const AnalyticsContext = React.createContext<
  | {
      trackEvent: OpticUIEvents;
    }
  | undefined
>(undefined);

export function useClientAgent() {
  const [clientAgent, setClientAgent] = useState<string | null>(null);
  useEffect(() => {
    async function loadIdentity() {
      await niceTry(async () => {
        const client = new Client('/api');
        const response = await client.getIdentity();
        if (response.ok) {
          const { anonymousId } = await response.json();
          setClientAgent(anonymousId);
        } else {
          setClientAgent('anon_id');
        }
      });
    }
    loadIdentity();
  }, [setClientAgent]);
  return clientAgent;
}

export function AnalyticsStore({ children }: { children: ReactNode }) {
  const appConfig = useAppConfig();
  //@ts-ignore
  const analytics = useRef(new Analytics());
  const clientAgent = useClientAgent();
  //initialize
  useEffect(() => {
    if (analytics.current && appConfig.analytics.enabled && clientAgent) {
      //segment
      analytics.current.use(SegmentIntegration);
      const integrationSettings = {
        'Segment.io': {
          apiKey: appConfig.analytics.segmentToken!,
          retryQueue: true,
          addBundledMetadata: true,
        },
      };
      analytics.current.initialize(integrationSettings);
      analytics.current.identify(clientAgent);
      //sentry
      Sentry.init({
        dsn: appConfig.analytics.sentryUrl!,
        release: clientId,
      });
      Sentry.setUser({ id: clientAgent });
    }
  }, [
    analytics,
    clientAgent,
    appConfig.analytics.enabled,
    appConfig.analytics.sentryUrl,
    appConfig.analytics.segmentToken,
  ]);

  const opticUITrackingEvents: React.MutableRefObject<OpticUIEvents> = useRef(
    new OpticUIEvents(async (event) => {
      if (appConfig.analytics.enabled) {
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
