import * as React from 'react';
import {
  useRouteMatch,
  useParams,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { LinearProgress } from '@material-ui/core';
import { Provider as BaseUrlProvider } from '<src>/hooks/useBaseUrl';
import { makeSpectacle, SpectacleInput } from '@useoptic/spectacle';
import { DocumentationPages } from '<src>/pages/docs';
import { SpectacleStore } from '<src>/contexts/spectacle-provider';
import { DebugOpticComponent } from '<src>/components';
import { DiffReviewEnvironments } from '<src>/pages/diffs/ReviewDiffPages';
import { IBaseSpectacle } from '@useoptic/spectacle';
import { IForkableSpectacle } from '@useoptic/spectacle';
import { InMemoryOpticContextBuilder } from '@useoptic/spectacle/build/in-memory';
import { CapturesServiceStore } from '<src>/hooks/useCapturesHook';
import { IOpticContext } from '@useoptic/spectacle';
import { ChangelogPages } from '<src>/pages/changelog/ChangelogPages';
import { ChangelogHistory } from '<src>/pages/changelogHistory';
import {
  AppConfigurationStore,
  OpticAppConfig,
} from '<src>/contexts/config/AppConfiguration';
import { AsyncStatus } from '<src>/types';
import { useOpticEngine } from '<src>/hooks/useOpticEngine';
import { useCallback, useEffect, useState } from 'react';
import { ConfigRepositoryStore } from '<src>/contexts/OpticConfigContext';
import { AnalyticsStore } from '<src>/contexts/analytics';
import {
  getMetadata,
  initialize,
  track,
} from '<src>/contexts/analytics/implementations/cloudViewerAnalytics';
import { store } from '<src>/store';
import { MetadataLoader } from '<src>/contexts/MetadataLoader';

const appConfig: OpticAppConfig = {
  config: {
    navigation: {
      showDiff: false,
    },
    analytics: {
      enabled: Boolean(process.env.REACT_APP_ENABLE_ANALYTICS === 'yes'),
      segmentToken: process.env.REACT_APP_SEGMENT_CLOUD_UI,
      fullStoryOrgId: process.env.REACT_APP_FULLSTORY_ORG,
      sentryUrl: process.env.REACT_APP_SENTRY_URL,
    },
    documentation: {
      allowDescriptionEditing: false,
    },
  },
};

export default function CloudViewer() {
  const shouldRenderChangelogHistory =
    process.env.REACT_APP_FF_SHOW_REVERT_COMMIT === 'true';

  const match = useRouteMatch();
  const params = useParams<{ specId: string; personId: string }>();
  const { personId, specId } = params;
  const task: CloudInMemorySpectacleDependenciesLoader = useCallback(async () => {
    const loadUploadedSpec = async () => {
      if (process.env.NODE_ENV === 'development') {
        const response = await fetch('/cloud-examples/example-1.json');
        const body = await response.json();
        return body;
      }
      const apiBase = (function () {
        if (window.location.hostname.indexOf('useoptic.com') >= 0) {
          return process.env.REACT_APP_PROD_API_BASE;
        } else {
          return process.env.REACT_APP_STAGING_API_BASE;
        }
      })();
      const response = await fetch(
        `${apiBase}/api/people/${personId}/public-specs/${specId}`,
        {
          headers: { accept: 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error(`could not find spec ${personId}/${specId}`);
      }
      const responseJson = await response.json();
      let signedUrl = responseJson.read_url;

      if (!signedUrl) {
        throw new Error(`No read url found: ${JSON.stringify(responseJson)}`);
      }

      let contentReq = await fetch(signedUrl);
      if (!contentReq.ok) {
        throw new Error(`Unable to fetch spec ${personId}/${specId}`);
      }

      let spec = await contentReq.json();
      return spec;
    };
    const [events] = await Promise.all([loadUploadedSpec()]);
    return {
      events,
      samples: [],
    };
  }, [specId, personId]);
  const { loading, error, data } = useCloudInMemorySpectacle(task);
  if (loading) {
    return <LinearProgress variant="indeterminate" />;
  }
  if (error) {
    return <div>error :(</div>;
  }
  if (!data) {
    return <div>something went wrong</div>;
  }

  //@SYNC public-examples.tsx cloud-viewer.tsx local-cli.tsx
  return (
    <AppConfigurationStore config={appConfig}>
      <SpectacleStore spectacle={data}>
        <ConfigRepositoryStore config={data.opticContext.configRepository}>
          <CapturesServiceStore
            capturesService={data.opticContext.capturesService}
          >
            <ReduxProvider store={store}>
              <BaseUrlProvider value={{ url: match.url }}>
                <AnalyticsStore
                  getMetadata={getMetadata(() =>
                    data.opticContext.configRepository.getApiName()
                  )}
                  initialize={initialize}
                  track={track}
                >
                  <DebugOpticComponent
                    specService={data.opticContext.specRepository}
                  />
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

class CloudInMemorySpectacle
  implements IForkableSpectacle, CloudInMemoryBaseSpectacle {
  private spectaclePromise: ReturnType<typeof makeSpectacle>;

  constructor(
    public readonly opticContext: IOpticContext,
    public samples: any[]
  ) {
    this.spectaclePromise = makeSpectacle(opticContext);
  }

  async fork(): Promise<IForkableSpectacle> {
    const opticContext = await InMemoryOpticContextBuilder.fromEvents(
      this.opticContext.opticEngine,
      [...(await this.opticContext.specRepository.listEvents())]
    );
    return new CloudInMemorySpectacle(opticContext, [...this.samples]);
  }

  async mutate<Result, Input = {}>(options: SpectacleInput<Input>) {
    const spectacle = await this.spectaclePromise;
    return spectacle.queryWrapper<Result, Input>(options);
  }

  async query<Result, Input = {}>(options: SpectacleInput<Input>) {
    const spectacle = await this.spectaclePromise;
    return spectacle.queryWrapper<Result, Input>(options);
  }
}

export interface CloudInMemoryBaseSpectacle extends IBaseSpectacle {
  samples: any[];
  opticContext: IOpticContext;
}

export interface CloudInMemorySpectacleDependencies {
  events: any[];
  samples: any[];
}

export type CloudInMemorySpectacleDependenciesLoader = () => Promise<CloudInMemorySpectacleDependencies>;

//@SYNC: useInMemorySpectacle useCloudInMemorySpectacle
export function useCloudInMemorySpectacle(
  loadDependencies: CloudInMemorySpectacleDependenciesLoader
): AsyncStatus<CloudInMemorySpectacle> {
  const opticEngine = useOpticEngine();
  const [spectacle, setSpectacle] = useState<CloudInMemorySpectacle>();
  const [inputs, setInputs] = useState<{
    events: any[];
    samples: any[];
  } | null>(null);

  useEffect(() => {
    async function task() {
      const result = await loadDependencies();
      setInputs({
        events: result.events,
        samples: result.samples,
      });
    }

    task();
  }, [loadDependencies]);

  useEffect(() => {
    async function task() {
      if (inputs === null) {
        return;
      }
      const opticContext = await InMemoryOpticContextBuilder.fromEventsAndInteractions(
        opticEngine,
        inputs.events,
        inputs.samples,
        'example-session'
      );
      const inMemorySpectacle = new CloudInMemorySpectacle(
        opticContext,
        inputs.samples
      );
      inMemorySpectacle.opticContext.specRepository.notifications.on(
        'change',
        async () => {
          const newEvents = await inMemorySpectacle.opticContext.specRepository.listEvents();
          setInputs({ events: newEvents, samples: inputs.samples });
        }
      );
      console.count('setSpectacle');
      setSpectacle(inMemorySpectacle);
    }

    task();
  }, [inputs, opticEngine]);

  if (spectacle) {
    return {
      loading: false,
      data: spectacle,
    };
  } else {
    return {
      loading: true,
    };
  }
}
