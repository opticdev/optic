import * as React from 'react';
import { useEffect, useState, useMemo, useRef } from 'react';
import {
  useRouteMatch,
  useParams,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { LinearProgress } from '@material-ui/core';
import { AsyncStatus } from '<src>/types';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as BaseUrlProvider } from '<src>/hooks/useBaseUrl';
import { DocumentationPages } from '<src>/pages/docs';
import { SpectacleStore } from '<src>/contexts/spectacle-provider';
import { DiffReviewEnvironments } from '<src>/pages/diffs/ReviewDiffPages';
import { CapturesServiceStore } from '<src>/hooks/useCapturesHook';
import { ChangelogPages } from '<src>/pages/changelog/ChangelogPages';
import { ChangelogHistory } from '<src>/pages/changelogHistory';
import { DebugOpticComponent } from '<src>/components';
import {
  AppConfigurationStore,
  OpticAppConfig,
} from '<src>/contexts/config/AppConfiguration';
import { ConfigRepositoryStore } from '<src>/contexts/OpticConfigContext';
import { useOpticEngine } from '<src>/hooks/useOpticEngine';
import {
  LocalCliCapturesService,
  LocalCliConfigRepository,
  LocalCliServices,
  LocalCliSpectacle,
  UILocalCliSpecRepository,
} from '@useoptic/spectacle-shared';
import { AnalyticsStore } from '<src>/contexts/analytics';
import {
  getMetadata,
  initialize,
  track,
} from '<src>/contexts/analytics/implementations/localCliAnalytics';
import { store } from '<src>/store';
import { MetadataLoader } from '<src>/contexts/MetadataLoader';

const appConfig: OpticAppConfig = {
  config: {
    navigation: {
      showDiff: true,
    },
    analytics: {
      enabled: Boolean(process.env.REACT_APP_ENABLE_ANALYTICS === 'yes'),
      segmentToken: process.env.REACT_APP_SEGMENT_LOCAL_UI,
      fullStoryOrgId: process.env.REACT_APP_FULLSTORY_ORG,
      sentryUrl: process.env.REACT_APP_SENTRY_URL,
    },
    documentation: {
      allowDescriptionEditing: true,
    },
  },
};

export default function LocalCli() {
  const shouldRenderChangelogHistory =
    process.env.REACT_APP_FF_SHOW_REVERT_COMMIT === 'true';
  const match = useRouteMatch();
  const params = useParams<{ specId: string }>();
  const { specId } = params;
  const { loading, error, data } = useLocalCliServices(specId);
  if (loading) {
    return <LinearProgress variant="indeterminate" />;
  }
  if (error) {
    return <div>error :(</div>;
  }
  if (!data) {
    return <div>something went wrong</div>;
  }

  return (
    <AppConfigurationStore config={appConfig}>
      <SpectacleStore spectacle={data.spectacle}>
        <ConfigRepositoryStore config={data.configRepository}>
          <CapturesServiceStore capturesService={data.capturesService}>
            <ReduxProvider store={store}>
              <BaseUrlProvider value={{ url: match.url }}>
                <AnalyticsStore
                  getMetadata={getMetadata(() =>
                    data.configRepository.getApiName()
                  )}
                  initialize={initialize}
                  track={track}
                >
                  <DebugOpticComponent specService={data.specRepository} />
                  <MetadataLoader>
                    <Switch>
                      {shouldRenderChangelogHistory && (
                        <Route
                          path={`${match.path}/changelog`}
                          component={ChangelogHistory}
                        />
                      )}
                      <Route
                        path={`${match.path}/changes-since/:batchId`}
                        component={ChangelogPages}
                      />
                      <Route
                        path={`${match.path}/documentation`}
                        component={DocumentationPages}
                      />
                      <Route
                        path={`${match.path}/diffs`}
                        component={DiffReviewEnvironments}
                      />
                      <Redirect to={`${match.path}/documentation`} />
                    </Switch>
                  </MetadataLoader>
                </AnalyticsStore>
              </BaseUrlProvider>
            </ReduxProvider>
          </CapturesServiceStore>
        </ConfigRepositoryStore>
      </SpectacleStore>
    </AppConfigurationStore>
  );
}

export function useLocalCliServices(
  specId: string
): AsyncStatus<LocalCliServices> {
  const opticEngine = useOpticEngine();
  const apiBaseUrl = `/api/specs/${specId}`;
  const [spectacle, setSpectacle] = useState(
    new LocalCliSpectacle(apiBaseUrl, opticEngine)
  );
  const refEngine = useRef(opticEngine);
  const refApiUrl = useRef(apiBaseUrl);
  useEffect(() => {
    const refreshFn = () => {
      setSpectacle(new LocalCliSpectacle(refApiUrl.current, refEngine.current));
    };
    spectacle.registerUpdateEvent(refreshFn);
    return () => spectacle.unregisterUpdateEvent(refreshFn);
  }, [spectacle]);
  const capturesService = useMemo(
    () =>
      new LocalCliCapturesService({
        baseUrl: apiBaseUrl,
        spectacle,
      }),
    [apiBaseUrl, spectacle]
  );
  const configRepository = new LocalCliConfigRepository({
    baseUrl: apiBaseUrl,
    spectacle,
  });
  const specRepository = new UILocalCliSpecRepository({ baseUrl: apiBaseUrl });
  return {
    loading: false,
    data: {
      spectacle,
      capturesService,
      opticEngine,
      configRepository,
      specRepository,
    },
  };
}
