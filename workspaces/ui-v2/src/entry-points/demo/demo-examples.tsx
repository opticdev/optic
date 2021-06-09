import React, { useCallback, useEffect, useState } from 'react';
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as BaseUrlProvider } from '<src>/hooks/useBaseUrl';
import { DocumentationPages } from '<src>/pages/docs';
import { SpectacleStore } from '<src>/contexts/spectacle-provider';
import { Loading } from '<src>/components';
import { DiffReviewEnvironments } from '<src>/pages/diffs/ReviewDiffPages';
import {
  InMemoryOpticContextBuilder,
  InMemorySpectacle,
} from '@useoptic/spectacle/build/in-memory';
import { CapturesServiceStore } from '<src>/hooks/useCapturesHook';
import { ChangelogPages } from '<src>/pages/changelog/ChangelogPages';
import {
  AppConfigurationStore,
  OpticAppConfig,
} from '<src>/contexts/config/AppConfiguration';
import { useOpticEngine } from '<src>/hooks/useOpticEngine';
import { AsyncStatus } from '<src>/types';
import { ConfigRepositoryStore } from '<src>/contexts/OpticConfigContext';
import { AnalyticsStore } from '<src>/contexts/analytics';
import {
  getMetadata,
  initialize,
  track,
} from '<src>/contexts/analytics/implementations/publicExampleAnalytics';
import { store } from '<src>/store';
import { MetadataLoader } from '<src>/contexts/MetadataLoader';

const appConfig: OpticAppConfig = {
  config: {
    navigation: {
      showChangelog: true,
      showDiff: true,
      showDocs: true,
    },
    analytics: {
      enabled: false,
    },
    documentation: {
      allowDescriptionEditing: true,
    },
  },
};

export default function DemoExamples(props: { lookupDir: string }) {
  const match = useRouteMatch();
  const params = useParams<{ exampleId: string }>();

  const { exampleId } = params;
  const task: InMemorySpectacleDependenciesLoader = useCallback(async () => {
    const loadExample = async () => {
      const response = await fetch(`/${props.lookupDir}/${exampleId}.json`, {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`could not find example ${exampleId}`);
      }
      const responseJson = await response.json();
      return responseJson;
    };
    const [example] = await Promise.all([loadExample()]);

    return {
      events: example.events,
      samples: example.session.samples,
      apiName: exampleId,
    };
  }, [exampleId, props.lookupDir]);

  const { loading, error, data } = useInMemorySpectacle(task);
  if (loading) {
    return <Loading />;
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
                  <MetadataLoader>
                    <Switch>
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

export interface InMemorySpectacleDependencies {
  events: any[];
  samples: any[];
  apiName: string;
}

export type InMemorySpectacleDependenciesLoader = () => Promise<InMemorySpectacleDependencies>;

//@SYNC: useInMemorySpectacle
export function useInMemorySpectacle(
  loadDependencies: InMemorySpectacleDependenciesLoader
): AsyncStatus<InMemorySpectacle> {
  const opticEngine = useOpticEngine();
  const [spectacle, setSpectacle] = useState<InMemorySpectacle>();
  const [inputs, setInputs] = useState<{
    events: any[];
    samples: any[];
    apiName: string;
  } | null>(null);

  useEffect(() => {
    async function task() {
      const result = await loadDependencies();
      setInputs({
        events: result.events,
        samples: result.samples,
        apiName: result.apiName,
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
        'example-session',
        { name: inputs.apiName, tasks: {} }
      );
      const inMemorySpectacle = new InMemorySpectacle(
        opticContext,
        inputs.samples
      );
      inMemorySpectacle.opticContext.specRepository.notifications.on(
        'change',
        async () => {
          const newEvents = await inMemorySpectacle.opticContext.specRepository.listEvents();
          setInputs({
            events: newEvents,
            samples: inputs.samples,
            apiName: inputs.apiName,
          });
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
