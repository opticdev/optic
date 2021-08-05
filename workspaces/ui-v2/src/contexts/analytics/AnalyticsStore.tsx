import React, {
  FC,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { OpticUIEvents, TrackingEventBase } from '@useoptic/analytics';
import { InvariantViolationError } from '<src>/errors';
import { useAppConfig } from '../config/AppConfiguration';
import { useAppSelector } from '<src>/store';

const packageJson = require('../../../package.json');
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
  specId: string;
};
type InputAnalyticsMetadata = Omit<AnalyticsMetadata, 'specId'>;

const defaultMetadata: InputAnalyticsMetadata = {
  clientId,
  clientAgent: 'anon_id',
  apiName: '',
};

export type AnalyticsStoreProps = {
  getMetadata: () => Promise<InputAnalyticsMetadata>;
  initialize: (
    metadata: InputAnalyticsMetadata,
    appConfig: ReturnType<typeof useAppConfig>
  ) => Promise<void>;
  track: (
    event: TrackingEventBase<any>,
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

  const [metadata, setMetadata] = useState<InputAnalyticsMetadata>(
    defaultMetadata
  );

  const specId = useAppSelector(
    (state) => state.metadata.data?.specificationId!
  );

  const cfgRef = useRef({
    metadata,
    specId,
  });

  useEffect(() => {
    cfgRef.current.metadata = metadata;
    cfgRef.current.specId = specId;
  }, [metadata, specId, cfgRef]);

  useEffect(() => {
    (async function () {
      if (appConfig.analytics.enabled) {
        const fetchedMetadata = await refGetMetadata.current();
        setMetadata(fetchedMetadata);
        refInitialize.current(fetchedMetadata, appConfig);
      }
    })();
  }, [appConfig]);

  const opticUITrackingEvents = useRef(
    new OpticUIEvents(async (event: any) => {
      if (appConfig.analytics.enabled) {
        refTrack.current(event, {
          ...cfgRef.current.metadata,
          specId: cfgRef.current.specId ?? 'anon-spec-id',
        });
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
  if (!value) {
    throw new InvariantViolationError(
      'useAnalytics could not find AnalyticsContext'
    );
  }
  return value.trackEvent;
}
