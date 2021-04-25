import * as React from 'react';
import { useEffect, useState } from 'react';
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
import { AsyncStatus, SpectacleStore } from './spectacle-provider';
import { Loading } from '../optic-components/loaders/Loading';
import { DiffReviewEnvironments } from '../optic-components/pages/diffs/ReviewDiffPages';
import { InMemoryInteractionLoaderStore } from './interaction-loader';
import { InMemoryOpticContextBuilder } from '@useoptic/spectacle/build/in-memory';
import { CapturesServiceStore } from '../optic-components/hooks/useCapturesHook';
import { ChangelogPages } from '../optic-components/pages/changelog/ChangelogPages';
import { useDocumentationPageLink } from '../optic-components/navigation/Routes';

export default function PublicExamples() {
  const match = useRouteMatch();
  const docsRoot = useDocumentationPageLink();
  const params = useParams<{ exampleId: string }>();
  const { exampleId } = params;
  const task: InMemorySpectacleDependenciesLoader = async () => {
    const loadExample = async () => {
      const response = await fetch(`/example-sessions/${exampleId}.json`, {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`could not find example ${exampleId}`);
      }
      const responseJson = await response.json();
      return responseJson;
    };
    const [example, opticEngine] = await Promise.all([
      loadExample(),
      import('@useoptic/diff-engine-wasm/engine/browser'),
    ]);
    return {
      events: example.events,
      samples: example.session.samples,
      opticEngine,
    };
  };
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

  return (
    <SpectacleStore spectacle={data}>
      <CapturesServiceStore capturesService={data.opticContext.capturesService}>
        <InMemoryInteractionLoaderStore samples={data.samples}>
          <BaseUrlProvider value={{ url: match.url }}>
            <Switch>
              <>
                <DiffReviewEnvironments />
                <DocumentationPages />
                <ChangelogPages />
                {/*<Redirect to={match.url + docsRoot.linkTo()} />*/}
              </>
            </Switch>
          </BaseUrlProvider>
        </InMemoryInteractionLoaderStore>
      </CapturesServiceStore>
    </SpectacleStore>
  );
}

export interface InMemorySpectacleDependencies {
  events: any[];
  opticEngine: any;
  samples: any[];
}

export type InMemorySpectacleDependenciesLoader = () => Promise<InMemorySpectacleDependencies>;

class InMemorySpectacle implements IForkableSpectacle, InMemoryBaseSpectacle {
  private spectaclePromise: Promise<any>;

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

  async mutate(options: SpectacleInput): Promise<any> {
    const spectacle = await this.spectaclePromise;
    return spectacle(options);
  }

  async query(options: SpectacleInput): Promise<any> {
    const spectacle = await this.spectaclePromise;
    return spectacle(options);
  }
}

export interface InMemoryBaseSpectacle extends IBaseSpectacle {
  samples: any[];
  opticContext: IOpticContext;
}

export function useInMemorySpectacle(
  loadDependencies: InMemorySpectacleDependenciesLoader
): AsyncStatus<InMemoryBaseSpectacle> {
  const [spectacle, setSpectacle] = useState<InMemoryBaseSpectacle>();

  useEffect(() => {
    async function task() {
      const result = await loadDependencies();
      //@ts-ignore
      //for debugging only. delete me
      window.events = result.events;
      const opticContext = await InMemoryOpticContextBuilder.fromEventsAndInteractions(
        result.opticEngine,
        result.events,
        result.samples,
        'example-session'
      );
      const inMemorySpectacle = new InMemorySpectacle(
        opticContext,
        result.samples
      );
      setSpectacle(inMemorySpectacle);
    }

    task();
    // should only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loading: !spectacle,
    data: spectacle,
  };
}
