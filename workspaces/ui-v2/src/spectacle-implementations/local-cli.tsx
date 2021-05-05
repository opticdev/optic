import * as React from 'react';
import { useRouteMatch, useParams, Switch } from 'react-router-dom';
import { AsyncStatus } from '<src>/types';
import { Provider as BaseUrlProvider } from '../optic-components/hooks/useBaseUrl';
import { DocumentationPages } from '../optic-components/pages/docs/DocumentationPage';
import { SpectacleStore } from './spectacle-provider';
import { DiffReviewEnvironments } from '../optic-components/pages/diffs/ReviewDiffPages';
import {
  IBaseSpectacle,
  ICapture,
  IListDiffsResponse,
  IListUnrecognizedUrlsResponse,
  IOpticCapturesService,
  IOpticDiffService,
  IOpticEngine,
  SpectacleInput,
  StartDiffResult,
} from '@useoptic/spectacle';
import { IForkableSpectacle } from '@useoptic/spectacle';
import { CapturesServiceStore } from '../optic-components/hooks/useCapturesHook';
import { ChangelogPages } from '../optic-components/pages/changelog/ChangelogPages';
import { JsonHttpClient } from '@useoptic/client-utilities';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { Loading } from '../optic-components/loaders/Loading';
import {
  AppConfigurationStore,
  OpticAppConfig,
} from '../optic-components/hooks/config/AppConfiguration';
import { InMemoryOpticContextBuilder } from '@useoptic/spectacle/build/in-memory';
import { InMemorySpectacle } from './public-examples';
import { useEffect, useState } from 'react';
import {
  OpticEngineStore,
  useOpticEngine,
} from '../optic-components/hooks/useOpticEngine';

const appConfig: OpticAppConfig = {
  featureFlags: {},
  config: {
    navigation: {
      showChangelog: true,
      showDiff: true,
      showDocs: true,
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
        <CapturesServiceStore capturesService={data.capturesService}>
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
      </SpectacleStore>
    </AppConfigurationStore>
  );
}

class LocalCliSpectacle implements IForkableSpectacle {
  constructor(private baseUrl: string, private opticEngine: IOpticEngine) {}
  async fork(): Promise<IBaseSpectacle> {
    const events = await JsonHttpClient.getJson(`${this.baseUrl}/events`);
    const opticContext = await InMemoryOpticContextBuilder.fromEvents(
      this.opticEngine,
      events
    );
    return new InMemorySpectacle(opticContext, []);
  }

  async mutate<Result, Input = {}>(
    options: SpectacleInput<Input>
  ): Promise<Result> {
    // send query to local cli-server
    return JsonHttpClient.postJson(`${this.baseUrl}/spectacle`, options);
  }

  async query<Result, Input = {}>(
    options: SpectacleInput<Input>
  ): Promise<Result> {
    // send query to local cli-server
    return JsonHttpClient.postJson(`${this.baseUrl}/spectacle`, options);
  }
}

interface LocalCliServices {
  spectacle: IBaseSpectacle;
  capturesService: IOpticCapturesService;
  opticEngine: IOpticEngine;
}
interface LocalCliCapturesServiceDependencies {
  baseUrl: string;
  spectacle: IBaseSpectacle;
}
interface LocalCliDiffServiceDependencies {
  baseUrl: string;
  spectacle: IBaseSpectacle;
  diffId: string;
  captureId: string;
}
class LocalCliCapturesService implements IOpticCapturesService {
  constructor(private dependencies: LocalCliCapturesServiceDependencies) {}
  async listCaptures(): Promise<ICapture[]> {
    const response = await JsonHttpClient.getJson(
      `${this.dependencies.baseUrl}/captures`
    );
    return response.captures;
  }

  async loadInteraction(
    captureId: string,
    pointer: string
  ): Promise<any | undefined> {
    const response = await JsonHttpClient.getJson(
      `${this.dependencies.baseUrl}/captures/${captureId}/interactions/${pointer}`
    );
    if (response.interaction) {
      return response.interaction;
    }
  }

  async startDiff(diffId: string, captureId: string): Promise<StartDiffResult> {
    await this.dependencies.spectacle.query({
      query: `mutation X($diffId: ID, $captureId: ID){
        startDiff(diffId: $diffId, captureId: $captureId) {
          notificationsUrl
        }
      }`,
      variables: {
        diffId,
        captureId,
      },
    });
    const onComplete = Promise.resolve(
      new LocalCliDiffService({ ...this.dependencies, diffId, captureId })
    );
    return {
      onComplete,
    };
  }
}
class LocalCliDiffService implements IOpticDiffService {
  constructor(private dependencies: LocalCliDiffServiceDependencies) {}

  async learnShapeDiffAffordances(): Promise<IValueAffordanceSerializationWithCounterGroupedByDiffHash> {
    const result = await JsonHttpClient.postJson(
      `${this.dependencies.baseUrl}/captures/${this.dependencies.captureId}/trail-values`,
      {
        diffId: this.dependencies.diffId,
      }
    );
    if (Object.keys(result).length === 0) {
      debugger;
    }
    //@aidan fixme
    return result;
  }

  async learnUndocumentedBodies(
    pathId: string,
    method: string,
    newPathCommands: any[]
  ): Promise<ILearnedBodies> {
    const result = await JsonHttpClient.postJson(
      `${this.dependencies.baseUrl}/captures/${this.dependencies.captureId}/initial-bodies`,
      { pathId, method, additionalCommands: newPathCommands }
    );
    debugger;
    return result;
  }

  async listDiffs(): Promise<IListDiffsResponse> {
    const result = await this.dependencies.spectacle.query<any, any>({
      query: `query X($diffId: ID) {
        diff(diffId: $diffId) {
          diffs
        }
      }`,
      variables: {
        diffId: this.dependencies.diffId,
      },
    });
    console.log(result.data!.diff.diffs);
    return result.data!.diff.diffs;
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    const result = await this.dependencies.spectacle.query<any, any>({
      query: `query X($diffId: ID) {
        diff(diffId: $diffId) {
          unrecognizedUrls
        }
      }`,
      variables: {
        diffId: this.dependencies.diffId,
      },
    });
    console.log(result.data!.diff.unrecognizedUrls);
    return result.data!.diff.unrecognizedUrls;
  }
}

export function useLocalCliServices(
  specId: string
): AsyncStatus<LocalCliServices> {
  const opticEngine = useOpticEngine();
  const apiBaseUrl = `/api/specs/${specId}`;
  const spectacle = new LocalCliSpectacle(apiBaseUrl, opticEngine);
  const capturesService = new LocalCliCapturesService({
    baseUrl: apiBaseUrl,
    spectacle,
  });
  return {
    loading: false,
    data: { spectacle, capturesService, opticEngine },
  };
}
