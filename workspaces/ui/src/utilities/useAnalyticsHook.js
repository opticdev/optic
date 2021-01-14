import React, { useContext, useMemo } from 'react';
import { useEffect, useState } from 'react';
import { newAnalyticsEventBus } from '@useoptic/analytics/lib/eventbus';
import niceTry from 'nice-try';
import { Client } from '@useoptic/cli-client';
import packageJson from '../../package.json';
import { wildcardEvent } from '@useoptic/analytics/lib/events/wildcard';

const clientId = `local_cli_${packageJson.version}`;

export function useApiNameAnalytics(specService) {
  const [apiName, setApiName] = useState('');
  useEffect(() => {
    async function getApiName() {
      try {
        const apiConfig = await specService.loadConfig();
        setApiName(apiConfig.config.name);
      } catch (e) {
        setApiName('unnamed api');
      }
    }
    if (specService && !apiName) {
      getApiName();
    }
  }, [specService]);

  return apiName;
}

export function useClientAgent() {
  const client = new Client('/api');
  const userPromise = useMemo(
    () =>
      new Promise(async (resolve) => {
        const anonymousId = await niceTry(async () => {
          const response = await client.getIdentity();
          if (response.ok) {
            const { user, anonymousId } = await response.json();
            if (window.opticAnalyticsEnabled) {
              window.FS.identify(anonymousId, {
                email: user && user.email,
              });
              window.Intercom('update', {
                user_id: anonymousId,
                id: user && user.sub,
                email: user && user.email,
              });
            }
            return anonymousId;
          }
          return 'anon_id';
        });

        resolve(anonymousId);
      })
  );
  return userPromise;
}

const AnalyticsContext = React.createContext('AnalyticsContext');

export function AnalyticsContextStore({ children, specService }) {
  const apiName = useApiNameAnalytics(specService);
  const userPromise = useClientAgent();

  useEffect(() => {
    if (!window.opticAnalyticsEnabled) {
      window.FS && window.FS.shutdown();
    }
  });

  const analyticsEvents = useMemo(() => {
    const bus = newAnalyticsEventBus(async (batchId) => {
      const clientAgent = await userPromise;

      const clientContext = {
        clientAgent: clientAgent,
        clientId: clientId,
        clientSessionInstanceId: batchId,
        clientTimestamp: new Date().toISOString(),
        apiName,
      };
      return clientContext;
    });

    // segment io sink
    bus.listen((event) => {
      if (!window.opticAnalyticsEnabled) return;
      const properties = {
        ...event.data,
        ...event.context,
      };
      window.analytics.track({
        userId: event.context.clientAgent,
        event: event.type,
        properties,
      });
    });

    return bus;
  }, [userPromise, apiName]);

  const track = async (event) => {
    if (apiName) {
      analyticsEvents.emit(event);
    }
  };

  return (
    <AnalyticsContext.Provider value={{ track }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsHook() {
  const { track } = useContext(AnalyticsContext);
  return (event, props) => track(wildcardEvent(event, props));
}
