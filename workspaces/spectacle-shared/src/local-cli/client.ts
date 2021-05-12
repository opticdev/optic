import {
  IBaseSpectacle,
  ICapture,
  IForkableSpectacle,
  IListDiffsResponse,
  IListUnrecognizedUrlsResponse,
  IOpticCapturesService,
  IOpticConfigRepository,
  IOpticDiffService,
  IOpticEngine,
  SpectacleInput,
  StartDiffResult,
} from '@useoptic/spectacle';
import { JsonHttpClient } from '@useoptic/client-utilities';
import {
  InMemoryOpticContextBuilder,
  InMemorySpectacle,
} from '@useoptic/spectacle/build/in-memory';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
} from '@useoptic/cli-shared/build/diffs/initial-types';

export class LocalCliSpectacle implements IForkableSpectacle {
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

export interface LocalCliServices {
  spectacle: IBaseSpectacle;
  capturesService: IOpticCapturesService;
  opticEngine: IOpticEngine;
  configRepository: IOpticConfigRepository;
}
export interface LocalCliCapturesServiceDependencies {
  baseUrl: string;
  spectacle: IBaseSpectacle;
}
export interface LocalCliDiffServiceDependencies {
  baseUrl: string;
  spectacle: IBaseSpectacle;
  diffId: string;
  captureId: string;
}
export class LocalCliCapturesService implements IOpticCapturesService {
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
export class LocalCliDiffService implements IOpticDiffService {
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
    return JsonHttpClient.postJson(
      `${this.dependencies.baseUrl}/captures/${this.dependencies.captureId}/initial-bodies`,
      { pathId, method, additionalCommands: newPathCommands }
    );
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

export interface LocalCliConfigRepositoryDependencies {
  baseUrl: string;
  spectacle: IBaseSpectacle;
}

export class LocalCliConfigRepository implements IOpticConfigRepository {
  constructor(private dependencies: LocalCliConfigRepositoryDependencies) {}

  async addIgnoreRule(rule: string): Promise<void> {
    await JsonHttpClient.patchJson(`${this.dependencies.baseUrl}/ignores`, {
      rule,
    });
  }

  async listIgnoreRules(): Promise<string[]> {
    throw new Error('should never be called');
  }
}
