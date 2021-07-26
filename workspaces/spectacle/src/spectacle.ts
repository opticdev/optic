import { graphql } from 'graphql';
import { schema } from './graphql/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { v4 as uuidv4 } from 'uuid';
import GraphQLJSON from 'graphql-type-json';
import {
  buildEndpointChanges,
  EndpointChanges,
  EndpointChange,
  buildEndpointsGraph,
  buildShapesGraph,
  ContributionsProjection,
  getArrayChanges,
  getContributionsProjection,
  getEndpointGraphNodeChange,
  getFieldChanges,
  CommandGenerator,
} from './helpers';
import { endpoints, shapes } from '@useoptic/graph-lib';
import { CQRSCommand } from '@useoptic/optic-domain';
import {
  IOpticContext,
  IOpticDiffService,
  SpectacleInput,
  GraphQLContext,
} from './types';

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
  const commandGenerator = new CommandGenerator(spec, opticContext.opticEngine);

  return {
    events,
    spec,
    endpointsQueries,
    shapesQueries,
    shapeViewerProjection,
    contributionsProjection,
    commandGenerator,
  };
}

export async function makeSpectacle(opticContext: IOpticContext) {
  let endpointsQueries: endpoints.GraphQueries,
    shapeQueries: shapes.GraphQueries,
    shapeViewerProjection: any,
    contributionsProjection: ContributionsProjection,
    commandGenerator: {
      endpoint: {
        remove: (pathId: string, method: string) => CQRSCommand[];
      };
    };

  // TODO: consider debouncing reloads (head and tail?)
  async function reload(opticContext: IOpticContext) {
    const projections = await buildProjections(opticContext);
    endpointsQueries = projections.endpointsQueries;
    shapeQueries = projections.shapesQueries;
    shapeViewerProjection = projections.shapeViewerProjection;
    contributionsProjection = projections.contributionsProjection;
    commandGenerator = projections.commandGenerator;
    return projections;
  }

  async function reloadFromSpecChange(
    specChanges: AsyncGenerator<number>,
    opticContext: IOpticContext
  ) {
    for await (let generation of specChanges) {
      console.log('reloading because of specRepository change', generation);
      await reload(opticContext);
    }
  }

  await reload(opticContext);

  // TODO: make sure this Promise is consumed somewhere so errors are handled. Return from makeSpectacle perhaps?
  const reloadingSpecs = reloadFromSpecChange(
    opticContext.specRepository.changes,
    opticContext
  );

  const resolvers = {
    JSON: GraphQLJSON,
    Mutation: {
      //@jaap: this mutation needs to be linearized/atomic so only one spec change executes at a time, against the latest spec.
      applyCommands: async (
        parent: any,
        args: {
          batchCommitId: string;
          commands: any[];
          commitMessage: string;
          clientId: string;
          clientSessionId: string;
        },
        context: GraphQLContext
      ) => {
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
          throw e;
        }

        await reload(context.spectacleContext().opticContext);

        return {
          batchCommitId,
        };
      },
      startDiff: async (
        parent: any,
        args: { diffId: string; captureId: string },
        context: GraphQLContext
      ) => {
        const { diffId, captureId } = args;
        const {
          onComplete,
        } = await context
          .spectacleContext()
          .opticContext.capturesService.startDiff(diffId, captureId);
        await onComplete;
        return {
          notificationsUrl: '',
        };
      },
      invalidateCaches: async (parent: any, _: {}, context: GraphQLContext) => {
        await reload(context.spectacleContext().opticContext);
      },
      resetToCommit: async (
        parent: any,
        args: { batchCommitId: string },
        context: GraphQLContext
      ) => {
        await context
          .spectacleContext()
          .opticContext.specRepository.resetToCommit(args.batchCommitId);

        await reload(context.spectacleContext().opticContext);
      },
    },
    Query: {
      paths: (parent: any, _: {}, context: GraphQLContext) => {
        return Promise.resolve(
          context
            .spectacleContext()
            .endpointsQueries.listNodesByType(endpoints.NodeType.Path).results
        );
      },
      // TODO @nic deprecate this
      requests: (parent: any, _: {}, context: GraphQLContext) => {
        return Promise.resolve(
          (context
            .spectacleContext()
            .endpointsQueries.listNodesByType(endpoints.NodeType.Endpoint)
            .results as endpoints.EndpointNodeWrapper[]).flatMap((endpoint) => {
            return endpoint.requests().results.map((request) => ({
              endpointNode: endpoint,
              requestNode: request,
            }));
          })
        );
      },
      shapeChoices: async (
        parent: any,
        // TODO shapeId should be non-nullable, but there are some shapes that call shapeId as null
        args: any,
        context: GraphQLContext
      ) => {
        return context.spectacleContext().shapeViewerProjection[args.shapeId];
      },
      endpoints: (parent: any, _: {}, context: GraphQLContext) => {
        return context
          .spectacleContext()
          .endpointsQueries.listNodesByType(endpoints.NodeType.Endpoint)
          .results;
      },
      endpoint: async (
        parent: any,
        args: { pathId: string; method: string },
        context: GraphQLContext
      ) => {
        return context
          .spectacleContext()
          .endpointsQueries.listNodesByType(endpoints.NodeType.Endpoint)
          .results.find((endpointNode) => {
            if (endpointNode.result.type === endpoints.NodeType.Endpoint) {
              const { pathId, httpMethod } = endpointNode.result.data;
              return args.pathId === pathId && args.method === httpMethod;
            }
            return false;
          });
      },
      endpointChanges: (
        parent: any,
        { sinceBatchCommitId }: { sinceBatchCommitId?: string },
        context: GraphQLContext
      ) => {
        const endpointChanges = buildEndpointChanges(
          endpointsQueries,
          shapeQueries,
          sinceBatchCommitId
        );
        return Promise.resolve(endpointChanges);
      },
      batchCommits: (parent: any, _: {}, context: GraphQLContext) => {
        return Promise.resolve(
          context
            .spectacleContext()
            .endpointsQueries.listNodesByType(endpoints.NodeType.BatchCommit)
            .results
        );
      },
      diff: async (
        parent: any,
        args: { diffId: string },
        context: GraphQLContext
      ) => {
        const { diffId } = args;
        return context
          .spectacleContext()
          .opticContext.diffRepository.findById(diffId);
      },
      metadata: async (parent: any, _: {}, context: GraphQLContext) => {
        const metadataKey = 'metadata';
        const specIdKey = 'id';
        const metadata =
          context.spectacleContext().contributionsProjection[metadataKey] || {};
        let specId = metadata[specIdKey];

        if (!specId) {
          specId = uuidv4();
          await context
            .spectacleContext()
            .opticContext.specRepository.applyCommands(
              [
                {
                  AddContribution: {
                    id: metadataKey,
                    key: specIdKey,
                    value: specId,
                  },
                },
              ],
              uuidv4(),
              'Initialize specification attributes',
              { clientId: '', clientSessionId: '' }
            );
          await reload(context.spectacleContext().opticContext);
        }
        return { id: specId };
      },
    },
    DiffState: {
      diffs: async (parent: IOpticDiffService) => {
        return parent.listDiffs();
      },
      unrecognizedUrls: async (parent: IOpticDiffService) => {
        return parent.listUnrecognizedUrls();
      },
    },
    // TODO @nic deprecate this
    HttpRequest: {
      id: (parent: {
        endpointNode: endpoints.EndpointNodeWrapper;
        requestNode: endpoints.RequestNodeWrapper;
      }) => {
        return Promise.resolve(parent.requestNode.value.requestId);
      },
      pathId: (parent: {
        endpointNode: endpoints.EndpointNodeWrapper;
        requestNode: endpoints.RequestNodeWrapper;
      }) => {
        return Promise.resolve(parent.endpointNode.path().value.pathId);
      },
      absolutePathPattern: (parent: {
        endpointNode: endpoints.EndpointNodeWrapper;
        requestNode: endpoints.RequestNodeWrapper;
      }) => {
        return Promise.resolve(
          parent.endpointNode.path().value.absolutePathPattern
        );
      },
      absolutePathPatternWithParameterNames: (parent: {
        endpointNode: endpoints.EndpointNodeWrapper;
        requestNode: endpoints.RequestNodeWrapper;
      }) => {
        return Promise.resolve(
          parent.endpointNode.path().absolutePathPatternWithParameterNames
        );
      },
      pathComponents: (parent: {
        endpointNode: endpoints.EndpointNodeWrapper;
        requestNode: endpoints.RequestNodeWrapper;
      }) => {
        let path = parent.endpointNode.path();
        let parentPath = path.parentPath();
        const components = [path.value];
        while (parentPath !== null) {
          components.push(parentPath.value);
          path = parentPath;
          parentPath = path.parentPath();
        }
        return Promise.resolve(components.reverse());
      },
      method: (parent: {
        endpointNode: endpoints.EndpointNodeWrapper;
        requestNode: endpoints.RequestNodeWrapper;
      }) => {
        return Promise.resolve(parent.endpointNode.value.httpMethod);
      },
      query: async (parent: {
        endpointNode: endpoints.EndpointNodeWrapper;
        requestNode: endpoints.RequestNodeWrapper;
      }) => {
        return parent.endpointNode.query();
      },
      bodies: (parent: {
        endpointNode: endpoints.EndpointNodeWrapper;
        requestNode: endpoints.RequestNodeWrapper;
      }) => {
        return Promise.resolve(
          parent.requestNode.body() ? [parent.requestNode.body()] : []
        );
      },
      responses: (parent: {
        endpointNode: endpoints.EndpointNodeWrapper;
        requestNode: endpoints.RequestNodeWrapper;
      }) => {
        return Promise.resolve(parent.endpointNode.responses().results);
      },
      pathContributions: (
        parent: {
          endpointNode: endpoints.EndpointNodeWrapper;
          requestNode: endpoints.RequestNodeWrapper;
        },
        _: {},
        context: GraphQLContext
      ) => {
        const pathId = parent.endpointNode.path().value.pathId;
        const method = parent.endpointNode.value.httpMethod;
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[
            `${pathId}.${method}`
          ] || {}
        );
      },
      requestContributions: (
        parent: {
          endpointNode: endpoints.EndpointNodeWrapper;
          requestNode: endpoints.RequestNodeWrapper;
        },
        _: {},
        context: GraphQLContext
      ) => {
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[
            parent.requestNode.value.requestId
          ] || {}
        );
      },
      isRemoved: (parent: {
        endpointNode: endpoints.EndpointNodeWrapper;
        requestNode: endpoints.RequestNodeWrapper;
      }) => {
        return Promise.resolve(parent.requestNode.value.isRemoved);
      },
    },
    Endpoint: {
      id: async (parent: endpoints.EndpointNodeWrapper) => {
        return parent.value.id;
      },
      pathId: async (parent: endpoints.EndpointNodeWrapper) => {
        return parent.value.pathId;
      },
      method: async (parent: endpoints.EndpointNodeWrapper) => {
        return parent.value.httpMethod;
      },
      pathComponents: async (parent: endpoints.EndpointNodeWrapper) => {
        let path = parent.path();
        let parentPath = path.parentPath();
        const components = [path.value];
        while (parentPath !== null) {
          components.push(parentPath.value);
          path = parentPath;
          parentPath = path.parentPath();
        }
        return components.reverse();
      },
      pathPattern: async (parent: endpoints.EndpointNodeWrapper) => {
        return parent.path().absolutePathPatternWithParameterNames;
      },
      query: async (parent: endpoints.EndpointNodeWrapper) => {
        return parent.query();
      },
      requests: async (parent: endpoints.EndpointNodeWrapper) => {
        return parent.requests().results;
      },
      responses: async (parent: endpoints.EndpointNodeWrapper) => {
        return parent.responses().results;
      },
      contributions: async (
        parent: endpoints.EndpointNodeWrapper,
        _: {},
        context: GraphQLContext
      ) => {
        const { pathId, httpMethod } = parent.value;
        return (
          context.spectacleContext().contributionsProjection[
            `${pathId}.${httpMethod}`
          ] || {}
        );
      },
      isRemoved: async (parent: endpoints.EndpointNodeWrapper) => {
        return parent.value.isRemoved;
      },
      commands: async (parent: endpoints.EndpointNodeWrapper) => {
        const { pathId, httpMethod } = parent.value;
        return {
          remove: commandGenerator.endpoint.remove(pathId, httpMethod),
        };
      },
    },
    // TODO @nic rename this to HttpRequest when old http request removed
    HttpRequestNew: {
      id: async (parent: endpoints.RequestNodeWrapper) => {
        return parent.value.requestId;
      },
      body: async (parent: endpoints.RequestNodeWrapper) => {
        return parent.body();
      },
      contributions: async (
        parent: endpoints.RequestNodeWrapper,
        _: {},
        context: GraphQLContext
      ) => {
        const { requestId } = parent.value;
        return (
          context.spectacleContext().contributionsProjection[requestId] || {}
        );
      },
      changes: async (
        parent: endpoints.RequestNodeWrapper,
        args: {
          sinceBatchCommitId?: string;
        },
        context: GraphQLContext
      ) => {
        const { requestId } = parent.value;
        return getEndpointGraphNodeChange(
          context.spectacleContext().endpointsQueries,
          requestId,
          args.sinceBatchCommitId
        );
      },
      isRemoved: async (parent: endpoints.RequestNodeWrapper) => {
        return parent.value.isRemoved;
      },
    },
    QueryParameters: {
      id: (parent: endpoints.QueryParametersNodeWrapper) => {
        return parent.value.queryParametersId;
      },
      rootShapeId: (parent: endpoints.QueryParametersNodeWrapper) => {
        return parent.value.rootShapeId;
      },
      isRemoved: (parent: endpoints.QueryParametersNodeWrapper) => {
        return parent.value.isRemoved;
      },
      changes: async (
        parent: endpoints.QueryParametersNodeWrapper,
        args: {
          sinceBatchCommitId?: string;
        },
        context: GraphQLContext
      ) => {
        const { queryParametersId } = parent.value;
        return getEndpointGraphNodeChange(
          context.spectacleContext().endpointsQueries,
          queryParametersId,
          args.sinceBatchCommitId
        );
      },
      contributions: (
        parent: endpoints.QueryParametersNodeWrapper,
        _: {},
        context: GraphQLContext
      ) => {
        const id = parent.value.queryParametersId;
        return context.spectacleContext().contributionsProjection[id] || {};
      },
    },
    Path: {
      absolutePathPattern: (parent: endpoints.PathNodeWrapper) => {
        return Promise.resolve(parent.value.absolutePathPattern);
      },
      isParameterized: (parent: endpoints.PathNodeWrapper) => {
        return Promise.resolve(parent.value.isParameterized);
      },
      name: (parent: endpoints.PathNodeWrapper) => {
        return Promise.resolve(parent.value.name);
      },
      pathId: (parent: endpoints.PathNodeWrapper) => {
        return Promise.resolve(parent.value.pathId);
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
      isRemoved: (parent: endpoints.PathNodeWrapper) => {
        return Promise.resolve(parent.value.isRemoved);
      },
    },
    HttpResponse: {
      id: (parent: endpoints.ResponseNodeWrapper) => {
        return Promise.resolve(parent.value.responseId);
      },
      statusCode: (parent: endpoints.ResponseNodeWrapper) => {
        return Promise.resolve(parent.value.httpStatusCode);
      },
      bodies: (parent: endpoints.ResponseNodeWrapper) => {
        return Promise.resolve(parent.bodies().results);
      },
      contributions: (
        parent: endpoints.ResponseNodeWrapper,
        _: {},
        context: GraphQLContext
      ) => {
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[
            parent.value.responseId
          ] || {}
        );
      },

      changes: async (
        parent: endpoints.ResponseNodeWrapper,
        args: {
          sinceBatchCommitId?: string;
        },
        context: GraphQLContext
      ) => {
        const { responseId } = parent.value;
        return getEndpointGraphNodeChange(
          context.spectacleContext().endpointsQueries,
          responseId,
          args.sinceBatchCommitId
        );
      },
      isRemoved: (parent: endpoints.ResponseNodeWrapper) => {
        return Promise.resolve(parent.value.isRemoved);
      },
    },
    PathComponent: {
      id: (parent: endpoints.PathNode) => {
        return Promise.resolve(parent.pathId);
      },
      contributions: (
        parent: endpoints.PathNode,
        _: {},
        context: GraphQLContext
      ) => {
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[parent.pathId] ||
            {}
        );
      },
      isRemoved: (parent: endpoints.PathNode) => {
        return Promise.resolve(parent.isRemoved);
      },
    },
    HttpBody: {
      contentType: (parent: endpoints.BodyNodeWrapper) => {
        return Promise.resolve(parent.value.httpContentType);
      },
      rootShapeId: (parent: endpoints.BodyNodeWrapper) => {
        return Promise.resolve(parent.value.rootShapeId);
      },
      isRemoved: (parent: endpoints.BodyNodeWrapper) => {
        return Promise.resolve(parent.value.isRemoved);
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
      changes: (
        parent: any,
        args: {
          sinceBatchCommitId?: string;
        },
        context: GraphQLContext
      ) => {
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
      changes: (
        parent: any,
        args: {
          sinceBatchCommitId?: string;
        },
        context: GraphQLContext
      ) => {
        return Promise.resolve(
          getFieldChanges(
            context.spectacleContext().shapeQueries,
            parent.fieldId,
            parent.shapeId,
            args.sinceBatchCommitId
          )
        );
      },
      contributions: (parent: any, _: {}, context: GraphQLContext) => {
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[parent.fieldId] ||
            {}
        );
      },
    },
    EndpointChanges: {
      endpoints: (parent: EndpointChanges) => {
        return Promise.resolve(parent.data.endpoints);
      },
    },
    EndpointChange: {
      // TODO @nic considering converting into ChangeResult
      change: (parent: EndpointChange) => {
        return Promise.resolve(parent.change);
      },
      path: (parent: EndpointChange) => {
        return Promise.resolve(parent.path);
      },
      pathId: (parent: EndpointChange) => {
        return Promise.resolve(parent.pathId);
      },
      method: (parent: EndpointChange) => {
        return Promise.resolve(parent.method);
      },
      contributions: (
        parent: EndpointChange,
        _: {},
        context: GraphQLContext
      ) => {
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
      category: (parent: EndpointChange['change']) => {
        return Promise.resolve(parent.category);
      },
    },
    BatchCommit: {
      createdAt: (parent: endpoints.BatchCommitNodeWrapper) => {
        return Promise.resolve(parent.value.createdAt);
      },
      batchId: (parent: endpoints.BatchCommitNodeWrapper) => {
        return Promise.resolve(parent.value.batchId);
      },
      commitMessage: (parent: endpoints.BatchCommitNodeWrapper) => {
        return Promise.resolve(parent.value.commitMessage);
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
      endpointsQueries,
      shapeQueries,
      shapeViewerProjection,
      contributionsProjection,
      commandGenerator,
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
