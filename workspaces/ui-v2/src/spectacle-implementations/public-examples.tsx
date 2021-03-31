import * as React from 'react';
import { useRouteMatch, useParams, Switch } from 'react-router-dom';
import { Provider as BaseUrlProvider } from '../optic-components/hooks/useBaseUrl';
import { makeSpectacle } from '@useoptic/spectacle';
import { useEffect, useState } from 'react';
import { DocumentationPages } from '../optic-components/pages/docs/DocumentationPage';
import { SpectacleStore } from './spectacle-provider';
import { Loading } from '../optic-components/navigation/Loading';
import { DiffReviewEnvironments } from '../optic-components/pages/diffs/ReviewDiffPages';
import { InMemoryInteractionLoaderStore } from './interaction-loader';
import { makeCurrentSpecContext } from '../lib/__tests/diff-helpers/universes/makeCurrentSpecContext';

export default function PublicExamples() {
  const match = useRouteMatch();
  const params = useParams<{ exampleId: string }>();
  const { exampleId } = params;
  const task: InMemorySpectacleDependenciesLoader = async () => {
    const loadEvents = async () => {
      const response = await fetch(`/example-sessions/${exampleId}.json`, {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`could not find example ${exampleId}`);
      }
      const responseJson = await response.json();
      return responseJson.events;
    };
    const loadSamples = async () => {
      const response = await fetch(`/example-sessions/${exampleId}.json`, {
        headers: { accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`could not find example ${exampleId}`);
      }
      const responseJson = await response.json();
      return responseJson.session.samples;
    };
    const [events, samples, opticEngine] = await Promise.all([
      loadEvents(),
      loadSamples(),
      import('@useoptic/diff-engine-wasm/engine/browser'),
    ]);
    return { events, samples, opticEngine };
  };
  const { loading, error, data } = useInMemorySpectacle(task);
  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <div>error :(</div>;
  }

  return (
    <SpectacleStore spectacle={data!}>
      <InMemoryInteractionLoaderStore samples={data!.samples}>
        <BaseUrlProvider value={{ url: match.url }}>
          <Switch>
            <>
              <DiffReviewEnvironments />
              <DocumentationPages />
            </>
          </Switch>
        </BaseUrlProvider>
      </InMemoryInteractionLoaderStore>
    </SpectacleStore>
  );
}

export type InMemorySpectacleDependenciesLoader = () => Promise<{
  events: any[];
  samples: any[];
  opticEngine: any;
}>;
export type AsyncStatus<T> = { loading: boolean; error?: Error; data?: T };

export interface Spectacle {
  query: any;
  samples: any[];
}

export function useInMemorySpectacle(
  loadDependencies: InMemorySpectacleDependenciesLoader
): AsyncStatus<Spectacle> {
  const [spectacle, setSpectacle] = useState<Spectacle>();

  useEffect(() => {
    async function task() {
      const result = await loadDependencies();
      const query: any = makeSpectacle(result.opticEngine, {
        specEvents: result.events,
      });

      // const specContext = await makeCurrentSpecContext(query);

      setSpectacle({ query, samples: result.samples });
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
