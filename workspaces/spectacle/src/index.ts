import { graphql } from 'graphql';
import { schema } from './graphql/schema';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { endpoints, shapes } from '@useoptic/graph-lib';
import * as endpointsGraph from '../../graph-lib/build/endpoints-graph';
import * as shapesGraph from '../../graph-lib/build/shapes-graph';
import { NodeType } from '../../graph-lib/build/shapes-graph';

export interface IOpticSpecRepository {
  listEvents(): Promise<any[]>
}

export interface IOpticContext {
  specRepository: IOpticSpecRepository;
}
export interface IBaseSpectacle {
  query(options: SpectacleInput): Promise<any>
  mutate(options: SpectacleInput): Promise<any>

}
export interface IForkableSpectacle extends IBaseSpectacle {
  fork(): Promise<IBaseSpectacle>
}

function buildEndpointsGraph(spec: any, opticEngine: any) {
  const serializedGraph = JSON.parse(opticEngine.get_endpoints_projection(spec));
  const {
    nodes, edges, nodeIndexToId
  } = serializedGraph;

  // console.log(JSON.stringify(serializedGraph, null, 2));

  const indexer = new endpoints.GraphIndexer();

  function remapId(arrayIndex: number) {
    const fallbackId = arrayIndex.toString();
    const id = nodeIndexToId[fallbackId];
    if (id !== undefined) {
      return id;
    }
    return fallbackId;
  }

  nodes.forEach((node: endpoints.Node, index: number) => {
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
  const queries = new endpoints.GraphQueries(indexer);
  return queries;
}

function buildShapesGraph(spec: any, opticEngine: any) {
  const serializedGraph = JSON.parse(opticEngine.get_shapes_projection(spec));
  const {
    nodes, edges, nodeIndexToId
  } = serializedGraph;

  const indexer = new shapes.GraphIndexer();

  function remapId(arrayIndex: number) {
    const fallbackId = arrayIndex.toString();
    const id = nodeIndexToId[fallbackId];
    if (id !== undefined) {
      return id;
    }
    return fallbackId;
  }

  nodes.forEach((node: shapes.Node, index: number) => {
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
  const queries = new shapes.GraphQueries(indexer);
  return queries;
}

type EndpointChange = {
  change: {
    category: string
  }
  path: string
  method: string
}

type EndpointChanges = {
  data: {
    endpoints: EndpointChange[]
  }
}

function buildEndpointChanges(
  endpointQueries: endpointsGraph.GraphQueries,
  shapeQueries: shapesGraph.GraphQueries,
  since?: string
): EndpointChanges {
  let sortedBatchCommits = endpointQueries
    .listNodesByType(endpoints.NodeType.BatchCommit)
    .results
    .sort((a: any, b: any) => {
      return (a.result.data.createdAt < b.result.data.createdAt) ? 1 : -1;
    });

  // If there is no `since` date, we want to use every batch commit
  const deltaBatchCommits = since
    ? sortedBatchCommits.filter((batchCommit: any) => batchCommit.result.data.createdAt > since)
    : sortedBatchCommits;

  const changes = new Changes();

  deltaBatchCommits.forEach((batchCommit: any) => {
    batchCommit.requests().results.forEach((request: any) => {
      changes.captureChange('added', endpointFromRequest(request));
    });

    batchCommit.responses().results.forEach((response: any) => {
      changes.captureChange('updated', endpointFromResponse(response))
    });
  });

  // Gather batch commit neighbors
  const batchCommitNeighborIds = new Map();
  deltaBatchCommits.forEach((batchCommit: any) => {
    const batchCommitId = batchCommit.result.id;
    // TODO: create query for neighbors of all types
    shapeQueries.listIncomingNeighborsByType(batchCommitId, NodeType.Shape)
      .results
      .forEach((shape: any) => {
        batchCommitNeighborIds.set(shape.result.id, batchCommitId);
      });
    shapeQueries.listIncomingNeighborsByType(batchCommitId, NodeType.Field)
      .results
      .forEach((field: any) => {
        batchCommitNeighborIds.set(field.result.id, batchCommitId);
      });
  });

  endpointQueries
    .listNodesByType(endpoints.NodeType.Body)
    .results
    .reduce((results: string[], bodyNode: any) => {
      const { rootShapeId } = bodyNode.result.data;
      if (batchCommitNeighborIds.has(rootShapeId)) {
        results.push(rootShapeId);
        return results;
      }
      for (const descendant of shapeQueries.descendantsIterator(rootShapeId)) {
        if (batchCommitNeighborIds.has(descendant.id)) {
          results.push(rootShapeId);
          return results;
        }
      }
      return results;
    }, [])
    .forEach((changedRootShapeId: any) => {
      const body: any = endpointQueries.findNodeById(changedRootShapeId);
      const response = body.response();
      if (response) {
        if (changes.captureChange('updated', endpointFromResponse(response))) {
          return;
        }
      }
      const request = body.request();
      if (request) {
        changes.captureChange('updated', endpointFromRequest(request));
      }
    });

  return changes.toEndpointChanges();
}

type Endpoint = {
  endpointId: string,
  path: string,
  method: string
}

class Changes {
  public changes: Map<string, EndpointChange>;

  constructor() {
    this.changes = new Map();
  }

  captureChange(category: string, endpoint: Endpoint): boolean {
    if (this.changes.has(endpoint.endpointId)) return false;
    this.changes.set(endpoint.endpointId, {
      change: { category },
      path: endpoint.path,
      method: endpoint.method
    });
    return true;
  }

  toEndpointChanges(): EndpointChanges {
    return {
      data: {
        endpoints: Array.from(this.changes.values())
      }
    }
  }
}

function endpointFromRequest(request: any): Endpoint {
  const pathNode = request.path();
  const path = pathNode.result.data.absolutePathPattern;
  const method = request.result.data.httpMethod;
  const endpointId = JSON.stringify({ path, method });
  return { endpointId, path, method };
}

function endpointFromResponse(response: any): Endpoint {
  const pathNode = response.path();
  const path = pathNode.result.data.absolutePathPattern;
  const method = response.result.data.httpMethod;
  const endpointId = JSON.stringify({ path, method });
  return { endpointId, path, method };
}

export async function makeSpectacle(opticEngine: any, opticContext: IOpticContext) {
  const events = await opticContext.specRepository.listEvents();
  const spec = opticEngine.spec_from_events(
    JSON.stringify(events)
  );

  const endpointsQueries = buildEndpointsGraph(spec, opticEngine);
  const shapeQueries = buildShapesGraph(spec, opticEngine);
  const shapeViewerProjection = JSON.parse(opticEngine.get_shape_viewer_projection(spec));

  const resolvers = {
    Query: {
      requests: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(context.endpointsQueries.listNodesByType(endpoints.NodeType.Request).results);
      },
      shapeChoices: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(context.shapeViewerProjection[args.shapeId]);
      },
      endpointChanges: (parent: any, { since }: { since?: string }, context: any, info: any) => {
        const endpointChanges = buildEndpointChanges(endpointsQueries, shapeQueries, since);
        return Promise.resolve(endpointChanges);
      },
      batchCommits: (parent: any, args: any, context: any, info: any) => {
        return Promise.resolve(context.endpointsQueries.listNodesByType(endpoints.NodeType.BatchCommit).results);
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
  query: string,
  variables: {
    [key: string]: string
  },
  operationName?: string
}
