import { ExecutionResult, graphql } from 'graphql';
import { schema } from './graphql/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { EventEmitter } from 'events';
import GraphQLJSON from 'graphql-type-json';
import {
  buildEndpointChanges,
  buildEndpointsGraph,
  buildShapesGraph,
  ContributionsProjection,
  getArrayChanges,
  getContributionsProjection,
  getFieldChanges,
} from './helpers';
import { endpoints, shapes } from '@useoptic/graph-lib';
import { IOpticCommandContext } from './in-memory';
import {
  ILearnedBodies,
  IValueAffordanceSerializationWithCounterGroupedByDiffHash,
} from '@useoptic/cli-shared/build/diffs/initial-types';

export * from './openapi';
export * from './commands';

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

  notifications: EventEmitter;
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

  loadInteraction(captureId: string, pointer: string): Promise<any | undefined>;

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

  learnShapeDiffAffordances(): Promise<IValueAffordanceSerializationWithCounterGroupedByDiffHash>;
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
  fork(): Promise<IBaseSpectacle>;
}

////////////////////////////////////////////////////////////////////////////////

async function buildProjections(opticContext: IOpticContext) {
  const events = await opticContext.specRepository.listEvents();
  const spec = opticContext.opticEngine.spec_from_events(
    JSON.stringify(events)
  );

  const endpointsQueries = buildEndpointsGraph(spec, opticContext.opticEngine);
  const shapesQueries = buildShapesGraph(spec, opticContext.opticEngine);
  const shapeViewerProjection = JSON.parse(
    opticContext.opticEngine.get_shape_viewer_projection(spec)
  );
  const contributionsProjection = getContributionsProjection(
    spec,
    opticContext.opticEngine
  );

  return {
    events,
    spec,
    endpointsQueries,
    shapesQueries,
    shapeViewerProjection,
    contributionsProjection,
  };
}

export async function makeSpectacle(opticContext: IOpticContext) {
  let endpointsQueries: endpoints.GraphQueries,
    shapeQueries: shapes.GraphQueries,
    shapeViewerProjection: any,
    contributionsProjection: ContributionsProjection;

  async function reload(opticContext: IOpticContext) {
    const projections = await buildProjections(opticContext);
    endpointsQueries = projections.endpointsQueries;
    shapeQueries = projections.shapesQueries;
    shapeViewerProjection = projections.shapeViewerProjection;
    contributionsProjection = projections.contributionsProjection;
    return projections;
  }

  await reload(opticContext);

  const resolvers = {
    JSON: GraphQLJSON,
    Mutation: {
      //@jaap: this mutation needs to be linearized/atomic so only one spec change executes at a time, against the latest spec.
      applyCommands: async (parent: any, args: any, context: any) => {
        const {
          batchCommitId,
          commands,
          commitMessage,
          clientId,
          clientSessionId,
        } = args;
        try {
          await context
            .spectacleContext()
            .opticContext.specRepository.applyCommands(
              commands,
              batchCommitId,
              commitMessage,
              { clientId, clientSessionId }
            );
        } catch (e) {
          console.error(e);
          debugger;
        }

        await reload(context.spectacleContext().opticContext);

        return {
          batchCommitId,
        };
      },
      startDiff: async (parent: any, args: any, context: any) => {
        const { diffId, captureId } = args;
        await context
          .spectacleContext()
          .opticContext.capturesService.startDiff(
            diffId,
            captureId,
            context.spectacleContext().opticContext.specRepository,
            context.spectacleContext().opticContext.configRepository
          );
        return {
          notificationsUrl: '',
        };
      },
    },
    Query: {
      paths: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(
          context
            .spectacleContext()
            .endpointsQueries.listNodesByType(endpoints.NodeType.Path).results
        );
      },
      requests: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(
          context
            .spectacleContext()
            .endpointsQueries.listNodesByType(endpoints.NodeType.Request)
            .results
        );
      },
      shapeChoices: async (parent: any, args: any, context: any, info: any) => {
        return context.spectacleContext().shapeViewerProjection[args.shapeId];
      },
      endpointChanges: (
        parent: any,
        { sinceBatchCommitId }: { sinceBatchCommitId?: string },
        context: any,
        info: any
      ) => {
        const endpointChanges = buildEndpointChanges(
          endpointsQueries,
          shapeQueries,
          sinceBatchCommitId
        );
        return Promise.resolve(endpointChanges);
      },
      batchCommits: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(
          context
            .spectacleContext()
            .endpointsQueries.listNodesByType(endpoints.NodeType.BatchCommit)
            .results
        );
      },
      diff: async (parent: any, args: any, context: any, info: any) => {
        const { diffId } = args;
        return context
          .spectacleContext()
          .opticContext.diffRepository.findById(diffId);
      },
    },
    DiffState: {
      diffs: async (parent: IOpticDiffService, args: any, context: any) => {
        return parent.listDiffs();
      },
      unrecognizedUrls: async (
        parent: IOpticDiffService,
        args: any,
        context: any
      ) => {
        return parent.listUnrecognizedUrls();
      },
    },
    HttpRequest: {
      id: (parent: endpoints.RequestNodeWrapper) => {
        return Promise.resolve(parent.value.requestId);
      },
      pathId: (parent: endpoints.RequestNodeWrapper) => {
        return Promise.resolve(parent.path().value.pathId);
      },
      absolutePathPattern: (parent: endpoints.RequestNodeWrapper) => {
        return Promise.resolve(parent.path().value.absolutePathPattern);
      },
      absolutePathPatternWithParameterNames: (
        parent: endpoints.RequestNodeWrapper
      ) => {
        return Promise.resolve(
          parent.path().absolutePathPatternWithParameterNames
        );
      },
      pathComponents: (parent: endpoints.RequestNodeWrapper) => {
        let path = parent.path();
        let parentPath = path.parentPath();
        const components = [path.value];
        while (parentPath !== null) {
          components.push(parentPath.value);
          path = parentPath;
          parentPath = path.parentPath();
        }
        return Promise.resolve(components.reverse());
      },
      method: (parent: endpoints.RequestNodeWrapper) => {
        return Promise.resolve(parent.value.httpMethod);
      },
      bodies: (parent: endpoints.RequestNodeWrapper) => {
        return Promise.resolve(parent.bodies().results);
      },
      responses: (parent: endpoints.RequestNodeWrapper) => {
        return Promise.resolve(parent.responses());
      },
      pathContributions: (parent: any, args: any, context: any) => {
        const pathId = parent.path().value.pathId;
        const method = parent.value.httpMethod;
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[
            `${pathId}.${method}`
          ] || {}
        );
      },
      requestContributions: (parent: any, args: any, context: any) => {
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[
            parent.value.requestId
          ] || {}
        );
      },
    },
    Path: {
      absolutePathPattern: (parent: any) => {
        return Promise.resolve(parent.result.data.absolutePathPattern);
      },
      isParameterized: (parent: any) => {
        return Promise.resolve(parent.result.data.isParameterized);
      },
      name: (parent: any) => {
        return Promise.resolve(parent.result.data.name);
      },
      pathId: (parent: any) => {
        return Promise.resolve(parent.result.data.pathId);
      },

      parentPathId: (parent: endpoints.PathNodeWrapper) => {
        const parentPath = parent.parentPath();
        if (parentPath) {
          return Promise.resolve(parentPath.result.id);
        }
        return Promise.resolve(null);
      },
      absolutePathPatternWithParameterNames: (
        parent: endpoints.PathNodeWrapper
      ) => {
        return Promise.resolve(parent.absolutePathPatternWithParameterNames);
      },
    },
    HttpResponse: {
      id: (parent: any) => {
        return Promise.resolve(parent.result.data.responseId);
      },
      statusCode: (parent: any) => {
        return Promise.resolve(parent.result.data.httpStatusCode);
      },
      bodies: (parent: any) => {
        return Promise.resolve(parent.bodies().results);
      },
      contributions: (parent: any, args: any, context: any) => {
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[
            parent.result.data.responseId
          ] || {}
        );
      },
    },
    PathComponent: {
      id: (parent: endpoints.PathNode) => {
        return Promise.resolve(parent.pathId);
      },
      contributions: (parent: endpoints.PathNode, args: any, context: any) => {
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[parent.pathId] ||
            {}
        );
      },
    },
    HttpBody: {
      contentType: (parent: any) => {
        return Promise.resolve(parent.result.data.httpContentType);
      },
      rootShapeId: (parent: any) => {
        return Promise.resolve(parent.result.data.rootShapeId);
      },
    },
    OpticShape: {
      id: (parent: any) => {
        return Promise.resolve(parent.shapeId);
      },
      jsonType: (parent: any) => {
        return Promise.resolve(parent.jsonType);
      },
      asArray: (parent: any) => {
        if (parent.jsonType === 'Array') {
          return Promise.resolve(parent);
        }
      },
      asObject: (parent: any) => {
        if (parent.jsonType === 'Object') {
          return Promise.resolve(parent);
        }
      },
    },
    ArrayMetadata: {
      shapeId: (parent: any) => {
        return Promise.resolve(parent.itemShapeId);
      },
      changes: (parent: any, args: any, context: any) => {
        return Promise.resolve(
          getArrayChanges(
            context.spectacleContext().shapeQueries,
            parent.shapeId,
            args.sinceBatchCommitId
          )
        );
      },
    },
    ObjectFieldMetadata: {
      changes: (parent: any, args: any, context: any) => {
        return Promise.resolve(
          getFieldChanges(
            context.spectacleContext().shapeQueries,
            parent.fieldId,
            parent.shapeId,
            args.sinceBatchCommitId
          )
        );
      },
      contributions: (parent: any, args: any, context: any) => {
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[parent.fieldId] ||
            {}
        );
      },
    },
    EndpointChanges: {
      opticUrl: (parent: any) => {
        return Promise.resolve(parent.data.opticUrl);
      },
      endpoints: (parent: any) => {
        return Promise.resolve(parent.data.endpoints);
      },
    },
    EndpointChange: {
      // TODO: considering converting into ChangeResult
      change: (parent: any) => {
        return Promise.resolve(parent.change);
      },
      path: (parent: any) => {
        return Promise.resolve(parent.path);
      },
      pathId: (parent: any) => {
        return Promise.resolve(parent.pathId);
      },
      method: (parent: any) => {
        return Promise.resolve(parent.method);
      },
      contributions: (parent: any, args: any, context: any) => {
        const pathId = parent.pathId;
        const method = parent.method;
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[
            `${pathId}.${method}`
          ] || {}
        );
      },
    },
    EndpointChangeMetadata: {
      category: (parent: any) => {
        return Promise.resolve(parent.category);
      },
    },
    BatchCommit: {
      createdAt: (parent: any) => {
        return Promise.resolve(parent.result.data.createdAt);
      },
      batchId: (parent: any) => {
        return Promise.resolve(parent.result.data.batchId);
      },
      commitMessage: (parent: any) => {
        return Promise.resolve(parent.result.data.commitMessage);
      },
    },
  };

  const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers,
  });

  const graphqlContext = () => {
    return {
      opticContext,
      // @ts-ignore
      endpointsQueries,
      // @ts-ignore
      shapeQueries,
      shapeViewerProjection,
      // @ts-ignore
      contributionsProjection,
    };
  };
  const queryWrapper = function <Result, Input = {}>(
    input: SpectacleInput<Input>
  ) {
    return graphql<Result>({
      schema: executableSchema,
      source: input.query,
      variableValues: input.variables,
      operationName: input.operationName,
      contextValue: {
        spectacleContext: graphqlContext,
      },
    });
  };

  return {
    executableSchema,
    queryWrapper,
    reload,
    graphqlContext,
  };
}

export interface SpectacleInput<
  T extends {
    [key: string]: any;
  }
> {
  query: string;
  variables: T;
  operationName?: string;
}
