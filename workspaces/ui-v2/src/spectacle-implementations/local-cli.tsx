import * as React from 'react';
import { useMemo } from 'react';
import { useRouteMatch, useParams, Switch } from 'react-router-dom';
import { AsyncStatus } from '<src>/types';
import { Provider as BaseUrlProvider } from '<src>/optic-components/hooks/useBaseUrl';
import { DocumentationPages } from '<src>/optic-components/pages/docs';
import { SpectacleStore } from './spectacle-provider';
import { DiffReviewEnvironments } from '<src>/optic-components/pages/diffs/ReviewDiffPages';
import { CapturesServiceStore } from '<src>/optic-components/hooks/useCapturesHook';
import { ChangelogPages } from '<src>/optic-components/pages/changelog/ChangelogPages';
import { Loading } from '<src>/optic-components/loaders/Loading';
import {
  AppConfigurationStore,
  OpticAppConfig,
} from '<src>/optic-components/hooks/config/AppConfiguration';
import { ConfigRepositoryStore } from '<src>/optic-components/hooks/useConfigHook';
import { useOpticEngine } from '<src>/optic-components/hooks/useOpticEngine';
import {
  LocalCliCapturesService,
  LocalCliConfigRepository,
  LocalCliServices,
  LocalCliSpectacle,
} from '@useoptic/spectacle-shared';
import { AnalyticsStore } from '<src>/analytics';
import {
  getMetadata,
  initialize,
  track,
} from '<src>/analytics/implementations/localCliAnalytics';

const appConfig: OpticAppConfig = {
  featureFlags: {},
  config: {
    navigation: {
      showChangelog: true,
      showDiff: true,
      showDocs: true,
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
  const match = useRouteMatch();
  const params = useParams<{ specId: string }>();
  const { specId } = params;
  const { loading, error, data } = useLocalCliServices(specId);
  if (loading) {
    return <Loading />;
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
            <BaseUrlProvider value={{ url: match.url }}>
              <AnalyticsStore
                getMetadata={getMetadata(() =>
                  data.configRepository.getApiName()
                )}
                initialize={initialize}
                track={track}
              >
                <Switch>
                  <>
                    <DocumentationPages />
                    <DiffReviewEnvironments />
                    <ChangelogPages />
                  </>
                </Switch>
              </AnalyticsStore>
            </BaseUrlProvider>
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
  const spectacle = useMemo(
    () => new LocalCliSpectacle(apiBaseUrl, opticEngine),
    [apiBaseUrl, opticEngine]
  );
  const capturesService = React.useMemo(
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
  return {
    loading: false,
    data: { spectacle, capturesService, opticEngine, configRepository },
  };
}
