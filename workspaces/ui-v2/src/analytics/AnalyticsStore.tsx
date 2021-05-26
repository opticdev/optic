import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { OpticUIEvents } from '@useoptic/analytics/lib/optic-ui/OpticUIEvents';
import { IOpticAnalyticsEvent } from '@useoptic/analytics/lib/interfaces';
import invariant from 'invariant';
import { useAppConfig } from '../optic-components/hooks/config/AppConfiguration';

const packageJson = require('../../package.json');
const clientId = `local_cli_${packageJson.version}`;

const AnalyticsContext = React.createContext<
  | {
      trackEvent: OpticUIEvents;
    }
  | undefined
>(undefined);

type AnalyticsMetadata = {
  clientId: string;
  clientAgent: string;
  apiName: string;
};
const defaultMetadata = {
  clientId,
  clientAgent: 'anon_id',
  apiName: '',
};

export type AnalyticsStoreProps = {
  getMetadata: () => Promise<AnalyticsMetadata>;
  initialize: (
    metadata: AnalyticsMetadata,
    appConfig: ReturnType<typeof useAppConfig>
  ) => Promise<void>;
  track: (
    event: IOpticAnalyticsEvent,
    metadata: AnalyticsMetadata
  ) => Promise<void>;
};

export const AnalyticsStore: FC<AnalyticsStoreProps> = ({
  children,
  getMetadata,
  initialize,
  track,
}) => {
  const appConfig = useAppConfig();
  const refGetMetadata = useRef(getMetadata);
  const refInitialize = useRef(initialize);
  const refTrack = useRef(track);

  const [metadata, setMetadata] = useState<AnalyticsMetadata>(defaultMetadata);

  useEffect(() => {
    (async function () {
      if (appConfig.analytics.enabled) {
        const fetchedMetadata = await refGetMetadata.current();
        setMetadata(fetchedMetadata);
        refInitialize.current(fetchedMetadata, appConfig);
      }
    })();
  }, [appConfig]);

  const opticUITrackingEvents: React.MutableRefObject<OpticUIEvents> = useRef(
    new OpticUIEvents(async (event) => {
      if (appConfig.analytics.enabled) {
        refTrack.current(event, metadata);
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
};

export function useAnalytics(): OpticUIEvents {
  const value = useContext(AnalyticsContext);
  invariant(value, 'useAnalytics could not find AnalyticsContext');
  return value!.trackEvent;
}
