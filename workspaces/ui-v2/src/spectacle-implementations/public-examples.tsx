import * as React from 'react';
import { useRouteMatch, useParams, Switch } from 'react-router-dom';
import { Provider as BaseUrlProvider } from '../optic-components/hooks/useBaseUrl';
import { makeSpectacle } from '@useoptic/spectacle';
import { useEffect, useState } from 'react';
import { DocumentationPages } from '../optic-components/pages/DocumentationPage';
import { SpectacleStore } from './spectacle-provider';
import { Loading } from '../optic-components/navigation/Loading';

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
    const [events, opticEngine] = await Promise.all([
      loadEvents(),
      import('@useoptic/diff-engine-wasm/engine/browser'),
    ]);
    return { events, opticEngine };
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
      <BaseUrlProvider value={{ url: match.url }}>
        <Switch>
          <DocumentationPages />
        </Switch>
      </BaseUrlProvider>
    </SpectacleStore>
  );
}

export type InMemorySpectacleDependenciesLoader = () => Promise<{
  events: any[];
  opticEngine: any;
}>;
export type AsyncStatus<T> = { loading: boolean; error?: Error; data?: T };

export interface Spectacle {
  query: any;
}

export function useInMemorySpectacle(
  loadDependencies: InMemorySpectacleDependenciesLoader
): AsyncStatus<Spectacle> {
  const [spectacle, setSpectacle] = useState<Spectacle>();

  useEffect(() => {
    async function task() {
      const result = await loadDependencies();
      const query = makeSpectacle(result.opticEngine, {
        specEvents: result.events,
      });
      setSpectacle({ query });
    }

    task();
  }, []);

  return {
    loading: !spectacle,
    data: spectacle,
  };
}
