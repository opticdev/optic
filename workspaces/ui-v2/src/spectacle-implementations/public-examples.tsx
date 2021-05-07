import React, { useCallback, useEffect, useState } from 'react';
import { Switch, useParams, useRouteMatch } from 'react-router-dom';
import { Provider as BaseUrlProvider } from '../optic-components/hooks/useBaseUrl';
import {
  IBaseSpectacle,
  IForkableSpectacle,
  IOpticContext,
  makeSpectacle,
  SpectacleInput,
} from '@useoptic/spectacle';
import { DocumentationPages } from '../optic-components/pages/docs/DocumentationPage';
import { SpectacleStore } from './spectacle-provider';
import { Loading } from '../optic-components/loaders/Loading';
import { DiffReviewEnvironments } from '../optic-components/pages/diffs/ReviewDiffPages';
import { InMemoryOpticContextBuilder } from '@useoptic/spectacle/build/in-memory';
import { CapturesServiceStore } from '../optic-components/hooks/useCapturesHook';
import { ChangelogPages } from '../optic-components/pages/changelog/ChangelogPages';
import {
  AppConfigurationStore,
  OpticAppConfig,
} from '../optic-components/hooks/config/AppConfiguration';
import { useOpticEngine } from '../optic-components/hooks/useOpticEngine';
import { AsyncStatus } from '../types';
import { ConfigRepositoryStore } from '<src>/optic-components/hooks/useConfigHook';
import { AnalyticsStore } from '<src>/analytics';

const appConfig: OpticAppConfig = {
  featureFlags: {},
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

export default function PublicExamples(props: { lookupDir: string }) {
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

  //@ts-ignore
  data.isOG = true;

  return (
    <AppConfigurationStore config={appConfig}>
      <AnalyticsStore>
        <SpectacleStore spectacle={data}>
          <ConfigRepositoryStore config={data.opticContext.configRepository}>
            <CapturesServiceStore
              capturesService={data.opticContext.capturesService}
            >
              <BaseUrlProvider value={{ url: match.url }}>
                <Switch>
                  <>
                    <DocumentationPages />
                    <DiffReviewEnvironments />
                    <ChangelogPages />
                  </>
                </Switch>
              </BaseUrlProvider>
            </CapturesServiceStore>
          </ConfigRepositoryStore>
        </SpectacleStore>
      </AnalyticsStore>
    </AppConfigurationStore>
  );
}

export interface InMemorySpectacleDependencies {
  events: any[];
  samples: any[];
}

export type InMemorySpectacleDependenciesLoader = () => Promise<InMemorySpectacleDependencies>;

export class InMemorySpectacle
  implements IForkableSpectacle, InMemoryBaseSpectacle {
  private spectaclePromise: ReturnType<typeof makeSpectacle>;

  constructor(
    public readonly opticContext: IOpticContext,
    public samples: any[]
  ) {
    this.spectaclePromise = makeSpectacle(opticContext);
  }

  async fork(): Promise<IBaseSpectacle> {
    const opticContext = await InMemoryOpticContextBuilder.fromEventsAndInteractions(
      this.opticContext.opticEngine,
      [...(await this.opticContext.specRepository.listEvents())],
      this.samples,
      'example-session'
    );
    return new InMemorySpectacle(opticContext, [...this.samples]);
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

export interface InMemoryBaseSpectacle extends IBaseSpectacle {
  samples: any[];
  opticContext: IOpticContext;
}
//@SYNC: useInMemorySpectacle
export function useInMemorySpectacle(
  loadDependencies: InMemorySpectacleDependenciesLoader
): AsyncStatus<InMemoryBaseSpectacle> {
  const opticEngine = useOpticEngine();
  const [spectacle, setSpectacle] = useState<InMemoryBaseSpectacle>();
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
      const inMemorySpectacle = new InMemorySpectacle(
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
