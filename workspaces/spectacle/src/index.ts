import { graphql } from 'graphql';
import { schema } from './graphql/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { EventEmitter } from 'events';
import GraphQLJSON from 'graphql-type-json';
import { v4 as uuidv4 } from 'uuid';
import { buildEndpointChanges, buildEndpointsGraph } from './helpers';
import { endpoints } from '@useoptic/graph-lib';

export interface IOpticSpecRepository {
  listEvents(): Promise<any[]>;
}

export interface IOpticEngine {
  try_apply_commands(arg0: string, arg1: string): any;
  get_shape_viewer_projection(spec: any): string;
  spec_from_events(arg0: string): any;
}

export interface IOpticSpecReadWriteRepository extends IOpticSpecRepository {
  appendEvents(events: any[]): Promise<void>;

  notifications: EventEmitter;
}

export interface IOpticCapturesService {
}

export interface IOpticDiffService {
}

export interface IOpticContext {
  opticEngine: IOpticEngine
  specRepository: IOpticSpecReadWriteRepository
  capturesService: IOpticCapturesService
  diffService: IOpticDiffService
}

export interface IBaseSpectacle {
  query(options: SpectacleInput): Promise<any>;

  mutate(options: SpectacleInput): Promise<any>;
}

export interface IForkableSpectacle extends IBaseSpectacle {
  fork(): Promise<IBaseSpectacle>;
}

async function buildProjections(opticContext: IOpticContext) {
  const events = await opticContext.specRepository.listEvents();
  const spec = opticContext.opticEngine.spec_from_events(JSON.stringify(events));

  const endpointsQueries = buildEndpointsGraph(spec, opticContext.opticEngine);
  const shapeViewerProjection = JSON.parse(
    opticContext.opticEngine.get_shape_viewer_projection(spec)
  );

  return {
    events,
    spec,
    endpointsQueries,
    shapeViewerProjection
  };
}

export async function makeSpectacle(
  opticContext: IOpticContext
) {
  let endpointsQueries: endpoints.GraphQueries, shapeViewerProjection: any;

  async function reload(opticContext: IOpticContext) {
    const projections = await buildProjections(opticContext);
    endpointsQueries = projections.endpointsQueries;
    shapeViewerProjection = projections.shapeViewerProjection;
  }

  await reload(opticContext);

  const resolvers = {
    JSON: GraphQLJSON,
    Mutation: {
      applyCommands: async (parent: any, args: any, context: any) => {
        const batchCommitId = uuidv4();
        const events = await opticContext.specRepository.listEvents();
        const newEventsString = opticContext.opticEngine.try_apply_commands(
          JSON.stringify(args.commands),
          JSON.stringify(events)
        );
        const newEvents = JSON.parse(newEventsString);
        //@TODO: this mutation needs to be linearized/atomic so only one spec change executes at a time, against the latest spec.
        await context.opticContext.specRepository.appendEvents(newEvents);

        await reload(context.opticContext);

        return {
          batchCommitId
        };
      },
      startDiff: async (parent: any, args: any, context: any) => {
        const { diffId, captureId } = args;
        await context.opticContext.capturesService.startDiff(diffId, captureId);
        return {
          listDiffsQuery: `query {
            
          }`
        };
      }
    },
    Query: {
      requests: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(
          context.endpointsQueries.listNodesByType(endpoints.NodeType.Request)
            .results
        );
      },
      shapeChoices: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(context.shapeViewerProjection[args.shapeId]);
      },
      endpointChanges: (
        parent: any,
        { since }: { since?: string },
        context: any,
        info: any
      ) => {
        const endpointChanges = buildEndpointChanges(endpointsQueries, since);
        return Promise.resolve(endpointChanges);
      },
      batchCommits: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(
          context.endpointsQueries.listNodesByType(
            endpoints.NodeType.BatchCommit
          ).results
        );
      }
    },
    HttpRequest: {
      id: (parent: any) => {
        return Promise.resolve(parent.result.data.requestId);
      },
      pathId: (parent: any) => {
        return Promise.resolve(parent.path().result.data.pathId);
      },
      absolutePathPattern: (parent: any) => {
        return Promise.resolve(parent.path().result.data.absolutePathPattern);
      },
      method: (parent: any) => {
        return Promise.resolve(parent.result.data.httpMethod);
      },
      bodies: (parent: any) => {
        return Promise.resolve(parent.bodies().results);
      },
      responses: (parent: endpoints.RequestNodeWrapper) => {
        return Promise.resolve(parent.path().responses().results);
      }
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
      }
    },
    HttpBody: {
      contentType: (parent: any) => {
        return Promise.resolve(parent.result.data.httpContentType);
      },
      rootShapeId: (parent: any) => {
        return Promise.resolve(parent.result.data.rootShapeId);
      }
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
      }
    },
    ArrayMetadata: {
      shapeId: (parent: any) => {
        return Promise.resolve(parent.itemShapeId);
      }
    },
    EndpointChanges: {
      opticUrl: (parent: any) => {
        return Promise.resolve(parent.data.opticUrl);
      },
      endpoints: (parent: any) => {
        return Promise.resolve(parent.data.endpoints);
      }
    },
    EndpointChange: {
      change: (parent: any) => {
        return Promise.resolve(parent.change);
      },
      path: (parent: any) => {
        return Promise.resolve(parent.path);
      },
      method: (parent: any) => {
        return Promise.resolve(parent.method);
      }
    },
    EndpointChangeMetadata: {
      category: (parent: any) => {
        return Promise.resolve(parent.category);
      }
    },
    BatchCommit: {
      createdAt: (parent: any) => {
        return Promise.resolve(parent.result.data.createdAt);
      },
      batchId: (parent: any) => {
        return Promise.resolve(parent.result.data.batchId);
      }
    }
  };

  const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers
  });

  return function(input: SpectacleInput) {
    return graphql({
      schema: executableSchema,
      source: input.query,
      variableValues: input.variables,
      operationName: input.operationName,
      contextValue: {
        opticContext,
        endpointsQueries,
        shapeViewerProjection
      }
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