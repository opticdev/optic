import { ExecutionResult } from 'graphql';
import { EventEmitter } from 'events';

import {
  ILearnedBodies,
  IAffordanceTrailsDiffHashMap,
} from '@useoptic/cli-shared/build/diffs/initial-types';
import { IHttpInteraction, ShapeChoice } from '@useoptic/optic-domain';
import { endpoints, shapes } from '@useoptic/graph-lib';
import { CommandGenerator, ContributionsProjection } from './helpers';
import { IOpticCommandContext } from './in-memory';

////////////////////////////////////////////////////////////////////////////////

export interface IOpticEngine {
  try_apply_commands(
    commandsJson: string,
    eventsJson: string,
    batchId: string,
    commitMessage: string,
    clientId: string,
    clientSessionId: string
  ): any;

  affordances_to_commands(
    json_affordances_json: string,
    json_trail_json: string,
    id_generator_strategy: string
  ): string;

  get_shape_viewer_projection(spec: any): string;

  get_contributions_projection(spec: any): string;

  learn_shape_diff_affordances(
    spec: any,
    diff_results_json: string,
    tagged_interactions_jsonl: string
  ): string;

  learn_undocumented_bodies(
    spec: any,
    interactions_jsonl: string,
    id_generator_strategy: string
  ): string;

  spec_from_events(eventsJson: string): any;

  spec_endpoint_delete_commands(
    spec: any,
    path_id: string,
    method: string
  ): string;

  spec_field_remove_commands(spec: any, field_id: string): string;
}

////////////////////////////////////////////////////////////////////////////////

export interface IOpticSpecRepository {
  listEvents(): Promise<any[]>;
}

export interface IOpticSpecReadWriteRepository extends IOpticSpecRepository {
  applyCommands(
    commands: any[],
    batchCommitId: string,
    commitMessage: string,
    commandContext: IOpticCommandContext
  ): Promise<void>;

  changes: AsyncGenerator<number>;

  notifications: EventEmitter;

  resetToCommit(batchCommitId: string): Promise<void>;
}

////////////////////////////////////////////////////////////////////////////////

export interface ICapture {
  captureId: string;
  startedAt: string;
}

export interface StartDiffResult {
  //notifications: EventEmitter;
  onComplete: Promise<IOpticDiffService>;
}

export interface IOpticCapturesService {
  listCaptures(): Promise<ICapture[]>;

  loadInteraction(
    captureId: string,
    pointer: string
  ): Promise<IHttpInteraction>;

  startDiff(diffId: string, captureId: string): Promise<StartDiffResult>;
}

////////////////////////////////////////////////////////////////////////////////
export interface IListDiffsResponse {
  diffs: any[];
}

export interface IListUnrecognizedUrlsResponse {
  urls: IUnrecognizedUrl[];
}

export interface IUnrecognizedUrl {
  path: string;
  method: string;
  count: number;
}

export interface IOpticDiffService {
  listDiffs(): Promise<IListDiffsResponse>;

  listUnrecognizedUrls(): Promise<IListUnrecognizedUrlsResponse>;

  learnUndocumentedBodies(
    pathId: string,
    method: string,
    newPathCommands: any[]
  ): Promise<ILearnedBodies>;

  learnShapeDiffAffordances(): Promise<IAffordanceTrailsDiffHashMap>;
}

////////////////////////////////////////////////////////////////////////////////

export interface IOpticDiffRepository {
  findById(id: string): Promise<IOpticDiffService>;

  add(id: string, diff: IOpticDiffService): Promise<void>;
}

////////////////////////////////////////////////////////////////////////////////
export interface IOpticConfigRepository {
  addIgnoreRule(rule: string): Promise<void>;
  getApiName(): Promise<string>;
  listIgnoreRules(): Promise<string[]>;
}

export interface IOpticInteractionsRepository {
  listById(id: string): Promise<any[]>;

  set(id: string, interactions: any[]): Promise<void>;
}

////////////////////////////////////////////////////////////////////////////////

export interface IOpticContext {
  opticEngine: IOpticEngine;
  configRepository: IOpticConfigRepository;
  specRepository: IOpticSpecReadWriteRepository;
  capturesService: IOpticCapturesService;
  diffRepository: IOpticDiffRepository;
}

////////////////////////////////////////////////////////////////////////////////

export interface IBaseSpectacle {
  query<Result, Input = {}>(
    options: SpectacleInput<Input>
  ): Promise<ExecutionResult<Result>>;

  mutate<Result, Input = {}>(
    options: SpectacleInput<Input>
  ): Promise<ExecutionResult<Result>>;
}

export interface IForkableSpectacle extends IBaseSpectacle {
  fork(): Promise<IForkableSpectacle>;
}

// Record<ShapeId, ShapeChoice[]>
export type ShapeViewerProjection = Record<string, ShapeChoice[]>;

export interface SpectacleInput<
  T extends {
    [key: string]: any;
  }
> {
  query: string;
  variables: T;
  operationName?: string;
}

export type GraphQLContext = {
  spectacleContext: () => {
    opticContext: IOpticContext;
    endpointsQueries: endpoints.GraphQueries;
    shapeQueries: shapes.GraphQueries;
    shapeViewerProjection: ShapeViewerProjection;
    contributionsProjection: ContributionsProjection;
    commandGenerator: CommandGenerator;
  };
};
