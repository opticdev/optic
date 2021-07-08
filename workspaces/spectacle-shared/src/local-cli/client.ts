import {
  ICapture,
  IForkableSpectacle,
  IListDiffsResponse,
  IListUnrecognizedUrlsResponse,
  IOpticCapturesService,
  IOpticConfigRepository,
  IOpticDiffService,
  IOpticEngine,
  IOpticSpecRepository,
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
  IAffordanceTrailsDiffHashMap,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { IApiCliConfig } from '@useoptic/cli-config';
import { IHttpInteraction } from '@useoptic/optic-domain';
import { EventEmitter } from 'events';

export class LocalCliSpectacle implements IForkableSpectacle {
  private eventEmitter: EventEmitter;
  constructor(private baseUrl: string, private opticEngine: IOpticEngine) {
    this.eventEmitter = new EventEmitter();
  }
  async fork(): Promise<IForkableSpectacle> {
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
    const response = await JsonHttpClient.postJson(
      `${this.baseUrl}/spectacle`,
      options
    );
    this.eventEmitter.emit('update');
    return response;
  }

  async query<Result, Input = {}>(
    options: SpectacleInput<Input>
  ): Promise<Result> {
    // send query to local cli-server
    return JsonHttpClient.postJson(`${this.baseUrl}/spectacle`, options);
  }

  registerUpdateEvent<T extends (...args: any) => any>(fn: T) {
    this.eventEmitter.on('update', fn);
  }

  unregisterUpdateEvent<T extends (...args: any) => any>(fn: T) {
    this.eventEmitter.off('update', fn);
  }
}

export interface LocalCliServices {
  spectacle: IForkableSpectacle;
  capturesService: IOpticCapturesService;
  opticEngine: IOpticEngine;
  configRepository: IOpticConfigRepository;
  specRepository: IOpticSpecRepository;
}
export interface LocalCliCapturesServiceDependencies {
  baseUrl: string;
  spectacle: IForkableSpectacle;
}
export interface LocalCliDiffServiceDependencies {
  baseUrl: string;
  spectacle: IForkableSpectacle;
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
  ): Promise<IHttpInteraction> {
    const response = await JsonHttpClient.getJson(
      `${this.dependencies.baseUrl}/captures/${captureId}/interactions/${pointer}`
    );
    if (!response.interaction) {
      throw new Error(
        `Could not find interaction ${pointer} in capture ${captureId}`
      );
    }
    return response.interaction;
  }

  async startDiff(diffId: string, captureId: string): Promise<StartDiffResult> {
    await this.dependencies.spectacle.query({
      query: `mutation X($diffId: ID!, $captureId: ID!){
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

  async learnShapeDiffAffordances(): Promise<IAffordanceTrailsDiffHashMap> {
    const result = await JsonHttpClient.postJson(
      `${this.dependencies.baseUrl}/captures/${this.dependencies.captureId}/trail-values`,
      {
        diffId: this.dependencies.diffId,
      }
    );
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
      query: `query X($diffId: ID!) {
        diff(diffId: $diffId) {
          diffs
        }
      }`,
      variables: {
        diffId: this.dependencies.diffId,
      },
    });
    return result.data!.diff.diffs;
  }

  async listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse> {
    const result = await this.dependencies.spectacle.query<any, any>({
      query: `query X($diffId: ID!) {
        diff(diffId: $diffId) {
          unrecognizedUrls
        }
      }`,
      variables: {
        diffId: this.dependencies.diffId,
      },
    });
    return result.data!.diff.unrecognizedUrls;
  }
}

export interface LocalCliConfigRepositoryDependencies {
  baseUrl: string;
  spectacle: IForkableSpectacle;
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

  async getApiName(): Promise<string> {
    const result = await JsonHttpClient.getJson(
      `${this.dependencies.baseUrl}/config`
    );
    const config: IApiCliConfig = result.config;
    return config.name;
  }
}

export class UILocalCliSpecRepository implements IOpticSpecRepository {
  constructor(private dependencies: { baseUrl: string }) {}

  async listEvents(): Promise<any> {
    return JsonHttpClient.getJson(`${this.dependencies.baseUrl}/events`);
  }
}
