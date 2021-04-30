import * as React from 'react';
import { useRouteMatch, useParams, Switch } from 'react-router-dom';
import { Provider as BaseUrlProvider } from '../optic-components/hooks/useBaseUrl';
import { DocumentationPages } from '../optic-components/pages/docs/DocumentationPage';
import { AsyncStatus, SpectacleStore } from './spectacle-provider';
import { DiffReviewEnvironments } from '../optic-components/pages/diffs/ReviewDiffPages';
import { InMemoryInteractionLoaderStore } from './interaction-loader';
import {
  IBaseSpectacle,
  ICapture,
  IListDiffsResponse,
  IListUnrecognizedUrlsResponse,
  IOpticCapturesService,
  IOpticDiffService,
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
          <InMemoryInteractionLoaderStore samples={[]}>
            <BaseUrlProvider value={{ url: match.url }}>
              <Switch>
                <>
                  <DiffReviewEnvironments />
                  <DocumentationPages />
                  <ChangelogPages />
                </>
              </Switch>
            </BaseUrlProvider>
          </InMemoryInteractionLoaderStore>
        </CapturesServiceStore>
      </SpectacleStore>
    </AppConfigurationStore>
  );
}

export interface InMemorySpectacleDependencies {
  events: any[];
  opticEngine: any;
  samples: any[];
}

class LocalCliSpectacle implements IForkableSpectacle {
  constructor(private baseUrl: string) {}
  async fork(): Promise<IBaseSpectacle> {
    //@TODO: this is not really forking...either add functionality to cli-server or create an in-memory spectacle
    return this;
  }

  async mutate(options: SpectacleInput): Promise<any> {
    // send query to local cli-server
    return JsonHttpClient.postJson(`${this.baseUrl}/spectacle`, options);
  }

  async query(options: SpectacleInput): Promise<any> {
    // send query to local cli-server
    return JsonHttpClient.postJson(`${this.baseUrl}/spectacle`, options);
  }
}

interface LocalCliServices {
  spectacle: IBaseSpectacle;
  capturesService: IOpticCapturesService;
}
interface LocalCliCapturesServiceDependencies {
  baseUrl: string;
  spectacle: IBaseSpectacle;
}
class LocalCliCapturesService implements IOpticCapturesService {
  constructor(private dependencies: LocalCliCapturesServiceDependencies) {}
  async listCaptures(): Promise<ICapture[]> {
    const response = await JsonHttpClient.getJson(
      `${this.dependencies.baseUrl}/captures`
    );
    return response.captures.map((x: any) => {
      return { ...x, startedAt: new Date().toISOString() };
    });
  }

  async startDiff(diffId: string, captureId: string): Promise<StartDiffResult> {
    const result = await this.dependencies.spectacle.query({
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
      new LocalCliDiffService(this.dependencies, diffId)
    );
    return {
      onComplete,
    };
  }
}
class LocalCliDiffService implements IOpticDiffService {
  constructor(
    private dependencies: LocalCliCapturesServiceDependencies,
    private diffId: string
  ) {}

  learnShapeDiffAffordances(
    pathId: string,
    method: string
  ): Promise<IValueAffordanceSerializationWithCounterGroupedByDiffHash> {
    return Promise.reject(new Error('unimplemented'));
  }

  learnUndocumentedBodies(
    pathId: string,
    method: string
  ): Promise<ILearnedBodies> {
    return Promise.reject(new Error('unimplemented'));
  }

  async listDiffs(): Promise<IListDiffsResponse> {
    const result = await this.dependencies.spectacle.query({
      query: `query X($diffId: ID) {
        diff(diffId: $diffId) {
          diffs
        }
      }`,
      variables: {
        diffId: this.diffId,
      },
    });
    console.log(result.data.diff.diffs);
    return result.data.diff.diffs;
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    const result = await this.dependencies.spectacle.query({
      query: `query X($diffId: ID) {
        diff(diffId: $diffId) {
          unrecognizedUrls
        }
      }`,
      variables: {
        diffId: this.diffId,
      },
    });
    console.log(result.data.diff.unrecognizedUrls);
    return result.data.diff.unrecognizedUrls;
  }
}

export function useLocalCliServices(
  specId: string
): AsyncStatus<LocalCliServices> {
  const apiBaseUrl = `/api/specs/${specId}`;
  const spectacle = new LocalCliSpectacle(apiBaseUrl);
  const capturesService = new LocalCliCapturesService({
    baseUrl: apiBaseUrl,
    spectacle,
  });
  return {
    loading: false,
    error: false,
    data: { spectacle, capturesService },
  };
}
