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
import { Auth0Provider } from '@auth0/auth0-react';
import { SpecRepositoryStore } from '<src>/contexts/SpecRepositoryContext';

const appConfig: OpticAppConfig = {
  config: {
    features: {
      allowEditing: true,
    },
    analytics: {
      enabled: Boolean(process.env.REACT_APP_ENABLE_ANALYTICS === 'yes'),
      segmentToken: process.env.REACT_APP_SEGMENT_LOCAL_UI,
      fullStoryOrgId: process.env.REACT_APP_FULLSTORY_ORG,
      sentryUrl: process.env.REACT_APP_SENTRY_URL,
    },
    backendApi: {
      domain:
        (window.location.hostname.indexOf('useoptic.com') >= 0
          ? process.env.REACT_APP_PROD_API_BASE
          : process.env.REACT_APP_STAGING_API_BASE) || 'https://api.o3c.info',
    },
    sharing: {
      enabled: true,
      specViewerDomain:
        (process.env.NODE_ENV === 'development'
          ? process.env.REACT_APP_PROD_SPEC_VIEWER_BASE
          : process.env.REACT_APP_STAGING_SPEC_VIEWER_BASE) ||
        'https://spec.o3c.info',
    },
  },
};

const AUTH0_DOMAIN = process.env.REACT_APP_AUTH0_DOMAIN || 'optic.auth0.com';
const AUTH0_CLIENT_ID =
  process.env.REACT_APP_AUTH0_CLIENT_ID || 'S7AeH5IQweLb2KHNoyfQfKBtkroE1joF';

export default function LocalCli() {
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
              <SpecRepositoryStore specRepo={data.specRepository}>
                <BaseUrlProvider value={{ url: match.url }}>
                  <Auth0Provider
                    domain={AUTH0_DOMAIN}
                    clientId={AUTH0_CLIENT_ID}
                    audience={appConfig.config.backendApi.domain}
                  >
                    <AnalyticsStore
                      getMetadata={getMetadata(() =>
                        data.configRepository.getApiName()
                      )}
                      initialize={initialize}
                      track={track}
                    >
                      <DebugOpticComponent />
                      <MetadataLoader>
                        <Switch>
                          <Route
                            path={`${match.path}/history`}
                            component={ChangelogHistory}
                          />
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
                  </Auth0Provider>
                </BaseUrlProvider>
              </SpecRepositoryStore>
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
