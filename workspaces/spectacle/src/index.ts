import { graphql } from 'graphql';
import { schema } from './graphql/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphIndexer, GraphQueries, NodeType, Node, RequestNodeWrapper } from '@useoptic/graph-lib';

export interface IOpticContext {
  specEvents: any[];
}

export function makeSpectacle(opticEngine: any, opticContext: IOpticContext) {
  const spec = opticEngine.spec_from_events(
    JSON.stringify(opticContext.specEvents)
  );
  const serializedGraph = JSON.parse(opticEngine.get_endpoints_projection(spec));
  const {
    nodes, edges, nodeIndexToId
  } = serializedGraph;

  const indexer = new GraphIndexer();

  function remapId(arrayIndex: number) {
    const fallbackId = arrayIndex.toString();
    const id = nodeIndexToId[fallbackId];
    if (id !== undefined) {
      return id;
    }
    return fallbackId;
  }

  nodes.forEach((node: Node, index: number) => {
    const id = remapId(index);
    indexer.addNode({
      ...node,
      id
    });
  });
  edges.forEach((e: [number, number, any]) => {
    const [sourceIndex, targetIndex, edge] = e;
    indexer.addEdge(edge, remapId(sourceIndex), remapId(targetIndex));
  });
  const queries = new GraphQueries(indexer);


  const resolvers = {
    Query: {
      request: (parent: any, args: any, context: any, info: any) => {
        console.log({
          parent
        });
        return Promise.resolve(context.queries.listNodesByType(NodeType.Request).results);
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
      body: (parent: any) => {
        return Promise.resolve(parent.bodies().results);
      },
      response: (parent: RequestNodeWrapper) => {
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
      body: (parent: any) => {
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
    }
  };

  const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers
  });

  return function(input: {
    operationName?: string;
    query: string;
    variables: any;
  }) {
    return graphql({
      schema: executableSchema,
      source: input.query,
      variableValues: input.variables,
      operationName: input.operationName,
      contextValue: {
        opticContext,
        queries
      }
    });
  };
}