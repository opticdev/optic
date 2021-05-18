import * as React from 'react';
import { useRouteMatch, useParams, Switch } from 'react-router-dom';
import { Provider as BaseUrlProvider } from '../optic-components/hooks/useBaseUrl';
import { makeSpectacle, SpectacleInput } from '@useoptic/spectacle';
import { DocumentationPages } from '<src>/optic-components/pages/docs';
import { SpectacleStore } from './spectacle-provider';
import { Loading } from '../optic-components/loaders/Loading';
import { DiffReviewEnvironments } from '../optic-components/pages/diffs/ReviewDiffPages';
import { IBaseSpectacle } from '@useoptic/spectacle';
import { IForkableSpectacle } from '@useoptic/spectacle';
import { InMemoryOpticContextBuilder } from '@useoptic/spectacle/build/in-memory';
import { CapturesServiceStore } from '../optic-components/hooks/useCapturesHook';
import { IOpticContext } from '@useoptic/spectacle';
import { ChangelogPages } from '../optic-components/pages/changelog/ChangelogPages';
import {
  AppConfigurationStore,
  OpticAppConfig,
} from '../optic-components/hooks/config/AppConfiguration';
import { AsyncStatus } from '<src>/types';
import { useOpticEngine } from '<src>/optic-components/hooks/useOpticEngine';
import { useCallback, useEffect, useState } from 'react';
import { ConfigRepositoryStore } from '<src>/optic-components/hooks/useConfigHook';
import { AnalyticsStore } from '<src>/analytics';
import {
  getMetadata,
  initialize,
  track,
} from '<src>/analytics/implementations/cloudViewerAnalytics';

const appConfig: OpticAppConfig = {
  featureFlags: {},
  config: {
    navigation: {
      showChangelog: true,
      showDiff: false,
      showDocs: true,
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
  const match = useRouteMatch();
  const params = useParams<{ specId: string }>();
  const { specId } = params;
  const task: CloudInMemorySpectacleDependenciesLoader = useCallback(async () => {
    const loadUploadedSpec = async () => {
      if (process.env.NODE_ENV === 'development') {
        const response = await fetch('/cloud-examples/example-1.json');
        const body = await response.json();
        return body;
      }
      const apiBase = (function () {
        if (window.location.hostname.indexOf('useoptic.com')) {
          return process.env.REACT_APP_PROD_API_BASE;
        } else {
          return process.env.REACT_APP_STAGING_API_BASE;
        }
      })();
      const response = await fetch(`${apiBase}/api/specs/${specId}`, {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`could not find spec ${specId}`);
      }
      const responseJson = await response.json();
      let signedUrl = responseJson.read_url;

      if (!signedUrl) {
        throw new Error(`No read url found: ${JSON.stringify(responseJson)}`);
      }

      let contentReq = await fetch(signedUrl);
      if (!contentReq.ok) {
        throw new Error(`Unable to fetch spec ${specId}`);
      }

      let spec = await contentReq.json();
      return spec;
    };
    const [events] = await Promise.all([loadUploadedSpec()]);
    return {
      events,
      samples: [],
    };
  }, [specId]);
  const { loading, error, data } = useCloudInMemorySpectacle(task);
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
            <BaseUrlProvider value={{ url: match.url }}>
              <AnalyticsStore
                getMetadata={getMetadata(() =>
                  data.opticContext.configRepository.getApiName()
                )}
                initialize={initialize}
                track={track}
              >
                <Switch>
                  <>
                    <DiffReviewEnvironments />
                    <DocumentationPages />
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

class CloudInMemorySpectacle
  implements IForkableSpectacle, CloudInMemoryBaseSpectacle {
  private spectaclePromise: ReturnType<typeof makeSpectacle>;

  constructor(
    public readonly opticContext: IOpticContext,
    public samples: any[]
  ) {
    this.spectaclePromise = makeSpectacle(opticContext);
  }

  async fork(): Promise<IBaseSpectacle> {
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
): AsyncStatus<CloudInMemoryBaseSpectacle> {
  const opticEngine = useOpticEngine();
  const [spectacle, setSpectacle] = useState<CloudInMemoryBaseSpectacle>();
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
