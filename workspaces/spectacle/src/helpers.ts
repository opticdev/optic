import { shapes, endpoints } from '@useoptic/graph-lib';
import { NodeType } from '../../graph-lib/build/shapes-graph';

export function buildEndpointsGraph(spec: any, opticEngine: any) {
  const serializedGraph = JSON.parse(
    opticEngine.get_endpoints_projection(spec),
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
      id,
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
  // console.log('nodes', nodes);

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
      id,
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
    category: string;
  };
  path: string;
  method: string;
};

type EndpointChanges = {
  data: {
    endpoints: EndpointChange[];
  };
};

export function buildEndpointChanges(
  endpointQueries: endpoints.GraphQueries,
  shapeQueries: shapes.GraphQueries,
  sinceBatchCommitId?: string,
): EndpointChanges {
  const sortedBatchCommits = endpointQueries
    .listNodesByType(endpoints.NodeType.BatchCommit)
    .results.sort((a: any, b: any) => {
      return a.result.data.createdAt < b.result.data.createdAt ? 1 : -1;
    });

  let deltaBatchCommits;

  if (sinceBatchCommitId) {
    const sinceBatchCommit: any = endpointQueries.findNodeById(
      sinceBatchCommitId!,
    );
    deltaBatchCommits = sortedBatchCommits.filter(
      (batchCommit: any) =>
        batchCommit.result.data.createdAt >
        sinceBatchCommit!.result.data.createdAt,
    );
  } else {
    deltaBatchCommits = sortedBatchCommits;
  }

  const changes = new Changes();

  deltaBatchCommits.forEach((batchCommit: any) => {
    batchCommit.requests().results.forEach((request: any) => {
      changes.captureChange('added', endpointFromRequest(request));
    });

    batchCommit.responses().results.forEach((response: any) => {
      changes.captureChange('updated', endpointFromResponse(response));
    });
  });

  // Gather batch commit neighbors
  const batchCommitNeighborIds = new Map();
  deltaBatchCommits.forEach((batchCommit: any) => {
    const batchCommitId = batchCommit.result.id;
    // TODO: create query for neighbors of all types
    shapeQueries
      .listIncomingNeighborsByType(batchCommitId, NodeType.Shape)
      .results.forEach((shape: any) => {
        batchCommitNeighborIds.set(shape.result.id, batchCommitId);
      });
    shapeQueries
      .listIncomingNeighborsByType(batchCommitId, NodeType.Field)
      .results.forEach((field: any) => {
        batchCommitNeighborIds.set(field.result.id, batchCommitId);
      });
  });

  endpointQueries
    .listNodesByType(endpoints.NodeType.Body)
    .results.reduce((results: string[], bodyNode: any) => {
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
  endpointId: string;
  path: string;
  method: string;
};

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
      method: endpoint.method,
    });
    return true;
  }

  toEndpointChanges(): EndpointChanges {
    return {
      data: {
        endpoints: Array.from(this.changes.values()),
      },
    };
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

//@TODO remove if not needed after testing
export function getShapeChanges(
  shapeQueries: shapes.GraphQueries,
  shapeId: string,
  sinceBatchCommitId?: string,
): ChangeResult {
  const results = {
    added: false,
    changed: false,
  };

  // TODO: figure out why shapeId is undefined
  if (!shapeId) return results;

  const sinceBatchCommit: any = shapeQueries.findNodeById(sinceBatchCommitId!)!;
  const shape: any = shapeQueries.findNodeById(shapeId)!;
  const deltaBatchCommits = getDeltaBatchCommits(
    shapeQueries,
    sinceBatchCommit.result.Id,
  );

  for (const batchCommit of shape.batchCommits().results) {
    if (deltaBatchCommits.has(batchCommit.result.id)) {
      return { ...results, added: true };
    }
  }

  return results;
}

export function getFieldChanges(
  shapeQueries: shapes.GraphQueries,
  fieldId: string,
  shapeId: string,
  sinceBatchCommitId?: string,
): ChangeResult {
  const results = {
    added: false,
    changed: false,
  };

  const deltaBatchCommits = getDeltaBatchCommits(
    shapeQueries,
    sinceBatchCommitId,
  );

  for (const batchCommitId of deltaBatchCommits.keys()) {
    for (const node of shapeQueries.listOutgoingNeighborsByEdgeType(
      fieldId,
      shapes.EdgeType.CreatedIn,
    ).results) {
      if (node.result.id === batchCommitId) return { ...results, added: true };
    }
  }

  // This will not deal with array item changes
  for (const batchCommitId of deltaBatchCommits.keys()) {
    for (const node of shapeQueries.listOutgoingNeighborsByEdgeType(
      fieldId,
      shapes.EdgeType.UpdatedIn,
    ).results) {
      if (node.result.id === batchCommitId) return { ...results, added: true };
    }
  }

  // If a field is an array, there may be changes related to the shape but not
  // the field itself.
  return checkForArrayChanges(
    shapeQueries,
    deltaBatchCommits,
    results,
    shapeId,
  );
}

export function getArrayChanges(
  shapeQueries: shapes.GraphQueries,
  shapeId: string,
  sinceBatchCommitId?: string,
): ChangeResult {
  const results = {
    added: false,
    changed: false,
  };

  const deltaBatchCommits = getDeltaBatchCommits(
    shapeQueries,
    sinceBatchCommitId,
  );

  return checkForArrayChanges(
    shapeQueries,
    deltaBatchCommits,
    results,
    shapeId,
  );
}

function checkForArrayChanges(
  shapeQueries: shapes.GraphQueries,
  deltaBatchCommits: any,
  results: ChangeResult,
  shapeId: string,
): ChangeResult {
  for (const batchCommitId of deltaBatchCommits.keys()) {
    for (const node of shapeQueries.listOutgoingNeighborsByEdgeType(
      shapeId,
      shapes.EdgeType.CreatedIn,
    ).results) {
      if (node.result.id === batchCommitId) return { ...results, added: true };
    }
  }

  // This will not deal with array item changes
  for (const batchCommitId of deltaBatchCommits.keys()) {
    for (const node of shapeQueries.listOutgoingNeighborsByEdgeType(
      shapeId,
      shapes.EdgeType.UpdatedIn,
    ).results) {
      if (node.result.id === batchCommitId)
        return { ...results, changed: true };
    }
  }

  return results;
}

type ChangeResult = {
  added: boolean;
  changed: boolean;
};

// TODO: use the endpointQueries one below
function getDeltaBatchCommits(
  shapeQueries: shapes.GraphQueries,
  sinceBatchCommitId?: string,
): any {
  let sortedBatchCommits = shapeQueries
    .listNodesByType(shapes.NodeType.BatchCommit)
    .results.sort((a: any, b: any) => {
      return a.result.data.createdAt < b.result.data.createdAt ? 1 : -1;
    });
  const sinceBatchCommit: any = shapeQueries.findNodeById(sinceBatchCommitId!)!;
  const deltaBatchCommits = new Map();
  (sinceBatchCommitId
    ? sortedBatchCommits.filter(
        (batchCommit: any) =>
          batchCommit.result.data.createdAt >
          sinceBatchCommit!.result.data.createdAt,
      )
    : sortedBatchCommits
  ).forEach((batchCommit: any) => {
    deltaBatchCommits.set(batchCommit.result.id, batchCommit);
  });
  return deltaBatchCommits;
}
