import * as React from 'react';
import { useRouteMatch, useParams, Switch } from 'react-router-dom';
import { Provider as BaseUrlProvider } from '../optic-components/hooks/useBaseUrl';
import { makeSpectacle, SpectacleInput } from '@useoptic/spectacle';
import { useEffect, useState } from 'react';
import { DocumentationPages } from '../optic-components/pages/docs/DocumentationPage';
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

const appConfig: OpticAppConfig = {
  featureFlags: {},
  config: {
    navigation: {
      showChangelog: true,
      showDiff: false,
      showDocs: true,
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
  const task: CloudInMemorySpectacleDependenciesLoader = async () => {
    const loadExample = async () => {
      let apiBase = process.env.REACT_APP_API_BASE;

      if (!apiBase) {
        if (window.location.hostname.indexOf('useoptic.com')) {
          apiBase = process.env.REACT_APP_PROD_API_BASE;
        } else {
          apiBase = process.env.REACT_APP_STAGING_API_BASE;
        }
      }

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
    const [events] = await Promise.all([loadExample()]);
    return {
      events,
      samples: [],
    };
  };
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

  return (
    <AppConfigurationStore config={appConfig}>
      <SpectacleStore spectacle={data}>
        <CapturesServiceStore
          capturesService={data.opticContext.capturesService}
        >
          <BaseUrlProvider value={{ url: match.url }}>
            <Switch>
              <>
                <DiffReviewEnvironments />
                <DocumentationPages />
                <ChangelogPages />
              </>
            </Switch>
          </BaseUrlProvider>
        </CapturesServiceStore>
      </SpectacleStore>
    </AppConfigurationStore>
  );
}

export interface CloudInMemorySpectacleDependencies {
  events: any[];
  samples: any[];
}

export type CloudInMemorySpectacleDependenciesLoader = () => Promise<CloudInMemorySpectacleDependencies>;

class CloudInMemorySpectacle
  implements IForkableSpectacle, InMemoryBaseSpectacle {
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

  async mutate<Result, Input>(options: SpectacleInput<Input>) {
    const spectacle = await this.spectaclePromise;
    return spectacle.queryWrapper<Result, Input>(options);
  }

  async query<Result, Input>(options: SpectacleInput<Input>) {
    const spectacle = await this.spectaclePromise;
    return spectacle.queryWrapper<Result, Input>(options);
  }
}

export interface InMemoryBaseSpectacle extends IBaseSpectacle {
  samples: any[];
  opticContext: IOpticContext;
}

export function useCloudInMemorySpectacle(
  loadDependencies: CloudInMemorySpectacleDependenciesLoader
): AsyncStatus<InMemoryBaseSpectacle> {
  //@dev fill this in
  throw new Error('copy me from public-examples.tsx when ready');
}
