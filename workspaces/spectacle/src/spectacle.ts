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
  getFieldChanges,
} from './helpers';
import { endpoints, shapes } from '@useoptic/graph-lib';
import { CQRSCommand } from '@useoptic/optic-domain';
import {
  IOpticContext,
  IOpticDiffService,
  SpectacleInput,
  GraphQLContext,
  EndpointProjection,
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

  return {
    events,
    spec,
    endpointsQueries,
    shapesQueries,
    shapeViewerProjection,
    contributionsProjection,
    getEndpointProjection: (
      pathId: string,
      method: string
    ): EndpointProjection => {
      const endpointProjection = opticContext.opticEngine.spec_endpoint_delete_commands(
        spec,
        pathId,
        method
      );
      return {
        commands: {
          remove: JSON.parse(endpointProjection).commands,
        },
      };
    },
  };
}

export async function makeSpectacle(opticContext: IOpticContext) {
  let endpointsQueries: endpoints.GraphQueries,
    shapeQueries: shapes.GraphQueries,
    shapeViewerProjection: any,
    contributionsProjection: ContributionsProjection,
    getEndpointProjection: (
      pathId: string,
      method: string
    ) => {
      commands: {
        remove: CQRSCommand[];
      };
    };

  // TODO: consider debouncing reloads (head and tail?)
  async function reload(opticContext: IOpticContext) {
    const projections = await buildProjections(opticContext);
    endpointsQueries = projections.endpointsQueries;
    shapeQueries = projections.shapesQueries;
    shapeViewerProjection = projections.shapeViewerProjection;
    contributionsProjection = projections.contributionsProjection;
    getEndpointProjection = projections.getEndpointProjection;
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
        await context
          .spectacleContext()
          .opticContext.capturesService.startDiff(diffId, captureId);
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
      requests: (parent: any, _: {}, context: GraphQLContext) => {
        return Promise.resolve(
          context
            .spectacleContext()
            .endpointsQueries.listNodesByType(endpoints.NodeType.Request)
            .results
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
      endpoint: async (
        parent: any,
        args: { pathId: string; method: string },
        context: GraphQLContext
      ) => {
        const { pathId, method } = args;
        return context.spectacleContext().getEndpointProjection(pathId, method);
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
      query: async (parent: endpoints.RequestNodeWrapper) => {
        return process.env.REACT_APP_FF_LEARN_UNDOCUMENTED_QUERY_PARAMETERS ===
          'true'
          ? parent.query()
          : null;
      },
      bodies: (parent: endpoints.RequestNodeWrapper) => {
        return Promise.resolve(parent.bodies().results);
      },
      responses: (parent: endpoints.RequestNodeWrapper) => {
        return Promise.resolve(parent.responses());
      },
      pathContributions: (
        parent: endpoints.RequestNodeWrapper,
        _: {},
        context: GraphQLContext
      ) => {
        const pathId = parent.path().value.pathId;
        const method = parent.value.httpMethod;
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[
            `${pathId}.${method}`
          ] || {}
        );
      },
      requestContributions: (
        parent: endpoints.RequestNodeWrapper,
        _: {},
        context: GraphQLContext
      ) => {
        return Promise.resolve(
          context.spectacleContext().contributionsProjection[
            parent.value.requestId
          ] || {}
        );
      },
      isRemoved: (parent: endpoints.RequestNodeWrapper) => {
        return Promise.resolve(parent.value.isRemoved);
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

  const graphqlContext: GraphQLContext['spectacleContext'] = () => {
    return {
      opticContext,
      endpointsQueries,
      shapeQueries,
      shapeViewerProjection,
      contributionsProjection,
      getEndpointProjection,
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
