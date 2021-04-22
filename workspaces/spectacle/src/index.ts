import { graphql } from 'graphql';
import { schema } from './graphql/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { EventEmitter } from 'events';
import GraphQLJSON from 'graphql-type-json';
import { v4 as uuidv4 } from 'uuid';
import {
  buildEndpointChanges,
  buildEndpointsGraph,
  buildShapesGraph,
  getFieldChanges,
  getArrayChanges,
} from './helpers';
import { endpoints, shapes } from '@useoptic/graph-lib';

////////////////////////////////////////////////////////////////////////////////

export interface IOpticEngine {
  try_apply_commands(
    commandsJson: string,
    eventsJson: string,
    batchId: string,
    commitMessage: string,
  ): any;

  get_shape_viewer_projection(spec: any): string;

  spec_from_events(eventsJson: string): any;
}

////////////////////////////////////////////////////////////////////////////////

export interface IOpticSpecRepository {
  listEvents(): Promise<any[]>;
}

export interface IOpticSpecReadWriteRepository extends IOpticSpecRepository {
  appendEvents(events: any[]): Promise<void>;

  notifications: EventEmitter;
}

////////////////////////////////////////////////////////////////////////////////

export interface ICapture {
  captureId: string;
  startedAt: string;
}

export interface StartDiffResult {
  notifications: EventEmitter;
  onComplete: Promise<IOpticDiffService>;
}

export interface IOpticCapturesService {
  listCaptures(): Promise<ICapture[]>;

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
}

////////////////////////////////////////////////////////////////////////////////

export interface IOpticDiffRepository {
  findById(id: string): Promise<IOpticDiffService>;

  add(id: string, diff: IOpticDiffService): Promise<void>;
}

////////////////////////////////////////////////////////////////////////////////
export interface IOpticConfigRepository {
  ignoreRequests: string[];
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
  query(options: SpectacleInput): Promise<any>;

  mutate(options: SpectacleInput): Promise<any>;
}

export interface IForkableSpectacle extends IBaseSpectacle {
  fork(): Promise<IBaseSpectacle>;
}

////////////////////////////////////////////////////////////////////////////////

async function buildProjections(opticContext: IOpticContext) {
  const events = await opticContext.specRepository.listEvents();
  const spec = opticContext.opticEngine.spec_from_events(
    JSON.stringify(events),
  );

  const endpointsQueries = buildEndpointsGraph(spec, opticContext.opticEngine);
  const shapesQueries = buildShapesGraph(spec, opticContext.opticEngine);
  const shapeViewerProjection = JSON.parse(
    opticContext.opticEngine.get_shape_viewer_projection(spec),
  );

  return {
    events,
    spec,
    endpointsQueries,
    shapesQueries,
    shapeViewerProjection,
  };
}

export async function makeSpectacle(opticContext: IOpticContext) {
  let endpointsQueries: endpoints.GraphQueries,
    shapeQueries: shapes.GraphQueries,
    shapeViewerProjection: any;

  async function reload(opticContext: IOpticContext) {
    const projections = await buildProjections(opticContext);
    endpointsQueries = projections.endpointsQueries;
    shapeQueries = projections.shapesQueries;
    shapeViewerProjection = projections.shapeViewerProjection;
  }

  await reload(opticContext);

  const resolvers = {
    JSON: GraphQLJSON,
    Mutation: {
      applyCommands: async (parent: any, args: any, context: any) => {
        const batchCommitId = uuidv4();
        const events = await opticContext.specRepository.listEvents();
        try {
          const newEventsString = opticContext.opticEngine.try_apply_commands(
            JSON.stringify(args.commands),
            JSON.stringify(events),
            batchCommitId,
            'proposed changes',
          );
          const newEvents = JSON.parse(newEventsString);

          await context.opticContext.specRepository.appendEvents(newEvents);
        } catch (e) {
          console.error(e);
          debugger;
        }
        //@TODO: this mutation needs to be linearized/atomic so only one spec change executes at a time, against the latest spec.

        await reload(context.opticContext);

        return {
          batchCommitId,
        };
      },
      startDiff: async (parent: any, args: any, context: any) => {
        const { diffId, captureId } = args;
        await context.opticContext.capturesService.startDiff(
          diffId,
          captureId,
          context.opticContext.specRepository,
          context.opticContext.configRepository,
        );
        return {
          notificationsUrl: '',
        };
      },
    },
    Query: {
      requests: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(
          context.endpointsQueries.listNodesByType(endpoints.NodeType.Request)
            .results,
        );
      },
      shapeChoices: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(context.shapeViewerProjection[args.shapeId]);
      },
      endpointChanges: (
        parent: any,
        { sinceBatchCommitId }: { sinceBatchCommitId?: string },
        context: any,
        info: any,
      ) => {
        const endpointChanges = buildEndpointChanges(
          endpointsQueries,
          shapeQueries,
          sinceBatchCommitId,
        );
        return Promise.resolve(endpointChanges);
      },
      batchCommits: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(
          context.endpointsQueries.listNodesByType(
            endpoints.NodeType.BatchCommit,
          ).results,
        );
      },
      diff: async (parent: any, args: any, context: any, info: any) => {
        const { diffId } = args;
        return context.opticContext.diffRepository.findById(diffId);
      },
    },
    DiffState: {
      diffs: async (parent: IOpticDiffService, args: any, context: any) => {
        return parent.listDiffs();
      },
      unrecognizedUrls: async (
        parent: IOpticDiffService,
        args: any,
        context: any,
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
        return Promise.resolve(parent.path().responses().results);
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
    },
    PathComponent: {
      id(parent: endpoints.PathNode) {
        return Promise.resolve(parent.pathId);
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
            context.shapeQueries,
            parent.shapeId,
            args.sinceBatchCommitId,
          ),
        );
      },
    },
    ObjectFieldMetadata: {
      changes: (parent: any, args: any, context: any) => {
        return Promise.resolve(
          getFieldChanges(
            context.shapeQueries,
            parent.fieldId,
            parent.shapeId,
            args.sinceBatchCommitId,
          ),
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
      method: (parent: any) => {
        return Promise.resolve(parent.method);
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

  return function (input: SpectacleInput) {
    return graphql({
      schema: executableSchema,
      source: input.query,
      variableValues: input.variables,
      operationName: input.operationName,
      contextValue: {
        opticContext,
        endpointsQueries,
        shapeQueries,
        shapeViewerProjection,
      },
    });
  };
}

export interface SpectacleInput {
  query: string;
  variables: {
    [key: string]: any;
  };
  operationName?: string;
}
