import { shapes, endpoints } from '@useoptic/graph-lib';
import { NodeType } from '../../graph-lib/build/shapes-graph';

export function buildEndpointsGraph(spec: any, opticEngine: any) {
  const serializedGraph = JSON.parse(
    opticEngine.get_endpoints_projection(spec)
  );
  const { nodes, edges, nodeIndexToId } = serializedGraph;

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

export function buildShapesGraph(spec: any, opticEngine: any) {
  const serializedGraph = JSON.parse(opticEngine.get_shapes_projection(spec));
  const { nodes, edges, nodeIndexToId } = serializedGraph;

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

export function buildEndpointChanges(
  endpointQueries: endpoints.GraphQueries,
  shapeQueries: shapes.GraphQueries,
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

export function getShapeChanges(
  shapeQueries: shapes.GraphQueries,
  shapeId: string,
  sinceBatchCommitId?: string
): ChangeResult {
  let sortedBatchCommits = shapeQueries
    .listNodesByType(shapes.NodeType.BatchCommit)
    .results
    .sort((a: any, b: any) => {
      return (a.result.data.createdAt < b.result.data.createdAt) ? 1 : -1;
    });
  const sinceBatchCommit: any = shapeQueries.findNodeById(sinceBatchCommitId!)!;
  const shape: any = shapeQueries.findNodeById(shapeId)!;
  const deltaBatchCommits = new Map();

  (sinceBatchCommitId
    ? sortedBatchCommits.filter((batchCommit: any) => batchCommit.result.data.createdAt > sinceBatchCommit!.result.data.createdAt)
    : sortedBatchCommits)
    .forEach((batchCommit: any) => {
      deltaBatchCommits.set(batchCommit.result.id, batchCommit);
    })

  const results = {
    added: false,
    changed: false,
  }

  for (const batchCommit of shape.batchCommits().results) {
    if (deltaBatchCommits.has(batchCommit.result.id)) {
      return { ...results, added: true }
    }
  }

  return results;
}

type ChangeResult = {
  added: boolean,
  changed: boolean
}