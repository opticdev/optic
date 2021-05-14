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
import * as FullStory from '@fullstory/browser';
import { LogLevel } from '@sentry/types';
import { useApiName } from '<src>/optic-components/hooks/useApiNameHook';

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
  const apiName = useApiName();
  //@ts-ignore
  const analytics = useRef(new Analytics());
  const clientAgent = useClientAgent();
  //initialize
  useEffect(() => {
    if (analytics.current && appConfig.analytics.enabled && clientAgent) {
      //segment
      if (appConfig.analytics.segmentToken) {
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
      }
      //fullstory
      if (appConfig.analytics.fullStoryOrgId) {
        FullStory.init({ orgId: appConfig.analytics.fullStoryOrgId! });
      }
      //sentry
      if (appConfig.analytics.sentryUrl) {
        Sentry.init({
          dsn: appConfig.analytics.sentryUrl!,
          release: clientId,
          logLevel: LogLevel.Debug,
        });
        Sentry.setUser({ id: clientAgent });
      }
    }
  }, [
    analytics,
    clientAgent,
    appConfig.analytics.enabled,
    appConfig.analytics,
  ]);

  const opticUITrackingEvents: React.MutableRefObject<OpticUIEvents> = useRef(
    new OpticUIEvents(async (event) => {
      if (appConfig.analytics.enabled) {
        if (analytics.current) {
          analytics.current.track(event.name, {
            properties: { ...event.properties, clientId, apiName },
          });
          try {
            FullStory.event(event.name, event.properties);
          } catch (e) {}
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
