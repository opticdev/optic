import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { OpticUIEvents } from '@useoptic/analytics/lib/optic-ui/OpticUIEvents';
import invariant from 'invariant';
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
      const client = new Client('/api');
      try {
        const response = await client.getIdentity();
        if (response.ok) {
          const { anonymousId } = await response.json();
          setClientAgent(anonymousId);
        } else {
          throw new Error();
        }
      } catch (e) {
        setClientAgent('anon_id');
      }
    }
    loadIdentity();
  }, []);
  return clientAgent;
}

export function AnalyticsStore({ children }: { children: ReactNode }) {
  const appConfig = useAppConfig();
  const apiName = useApiName();
  const cliClient = new Client('/api');
  const clientAgent = useClientAgent();
  //initialize
  useEffect(() => {
    if (appConfig.analytics.enabled && clientAgent) {
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
  }, [clientAgent, appConfig.analytics.enabled, appConfig.analytics]);

  const opticUITrackingEvents: React.MutableRefObject<OpticUIEvents> = useRef(
    new OpticUIEvents(async (event) => {
      if (appConfig.analytics.enabled) {
        // TODO consolidate UI and cli events types
        cliClient.postTrackingEvents([
          {
            type: event.name,
            data: event.properties,
            // TODO update the context typing, this currently gets overriden in
            // the event bus
            context: {
              clientId: clientId,
              platform: '',
              arch: '',
              release: '',
              apiName: apiName,
              clientSessionInstanceId: '',
              clientTimestamp: '',
              clientAgent: '',
              source: '',
            },
          },
        ]);
        try {
          FullStory.event(event.name, event.properties);
        } catch (e) {}
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
