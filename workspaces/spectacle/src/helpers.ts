import { shapes, endpoints } from '@useoptic/graph-lib';
import { CQRSCommand } from '@useoptic/optic-domain';
import { IOpticEngine } from './types';

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

export type EndpointChange = {
  change: {
    category: string;
  };
  pathId: string;
  path: string;
  method: string;
};

export type EndpointChanges = {
  data: {
    endpoints: EndpointChange[];
  };
};

export function buildEndpointChanges(
  endpointQueries: endpoints.GraphQueries,
  shapeQueries: shapes.GraphQueries,
  sinceBatchCommitId?: string
): EndpointChanges {
  const deltaBatchCommits = getDeltaBatchCommitsForEndpoints(
    endpointQueries,
    sinceBatchCommitId
  );

  const changes = new Changes();

  [...deltaBatchCommits.values()].forEach(
    (batchCommit: endpoints.BatchCommitNodeWrapper) => {
      // Only createdIn and removedIn edges pointing to a request is treated as
      // an added or removed change, everything else is updated.
      // Bodies, and shape changes are handled below
      batchCommit
        .createdInEdgeNodes()
        .results.forEach((node: endpoints.NodeWrapper) => {
          if (node.result.type === endpoints.NodeType.Request) {
            changes.captureChange(
              'added',
              endpointFromRequest(node as endpoints.RequestNodeWrapper)
            );
          } else if (node.result.type === endpoints.NodeType.Response) {
            changes.captureChange(
              'updated',
              endpointFromResponse(node as endpoints.ResponseNodeWrapper)
            );
          }
        });
      batchCommit
        .removedInEdgeNodes()
        .results.forEach((node: endpoints.NodeWrapper) => {
          if (node.result.type === endpoints.NodeType.Request) {
            changes.captureChange(
              'removed',
              endpointFromRequest(node as endpoints.RequestNodeWrapper)
            );
          } else if (node.result.type === endpoints.NodeType.Response) {
            changes.captureChange(
              'updated',
              endpointFromResponse(node as endpoints.ResponseNodeWrapper)
            );
          }
        });
      batchCommit
        .updatedInEdgeNodes()
        .results.forEach((node: endpoints.NodeWrapper) => {
          if (node.result.type === endpoints.NodeType.Request) {
            changes.captureChange(
              'updated',
              endpointFromRequest(node as endpoints.RequestNodeWrapper)
            );
          } else if (node.result.type === endpoints.NodeType.Response) {
            changes.captureChange(
              'updated',
              endpointFromResponse(node as endpoints.ResponseNodeWrapper)
            );
          }
        });
    }
  );

  // Gather batch commit neighbors
  const batchCommitNeighborIds = new Map();
  [...deltaBatchCommits.values()].forEach((batchCommit: any) => {
    const batchCommitId = batchCommit.result.id;
    // TODO: create query for neighbors of all types
    shapeQueries
      .listIncomingNeighborsByType(batchCommitId, shapes.NodeType.Shape)
      .results.forEach((shape: any) => {
        batchCommitNeighborIds.set(shape.result.id, batchCommitId);
      });
    shapeQueries
      .listIncomingNeighborsByType(batchCommitId, shapes.NodeType.Field)
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
  pathId: string;
  path: string;
  method: string;
};

class Changes {
  public changes: Map<string, EndpointChange>;

  constructor() {
    this.changes = new Map();
  }

  captureChange(
    category: 'added' | 'updated' | 'removed',
    endpoint: Endpoint
  ): boolean {
    if (this.changes.has(endpoint.endpointId)) return false;
    this.changes.set(endpoint.endpointId, {
      change: { category },
      pathId: endpoint.pathId,
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

function endpointFromRequest(request: endpoints.RequestNodeWrapper): Endpoint {
  const endpoint = request.endpoint();
  const pathNode = endpoint.path();
  const { id: endpointId, pathId, httpMethod: method } = endpoint.value;
  const path = pathNode.absolutePathPatternWithParameterNames;
  return { endpointId, pathId, path, method };
}

function endpointFromResponse(
  response: endpoints.ResponseNodeWrapper
): Endpoint {
  const endpoint = response.endpoint();
  const pathNode = endpoint.path();
  const { id: endpointId, pathId, httpMethod: method } = endpoint.value;
  const path = pathNode.absolutePathPatternWithParameterNames;
  return { endpointId, pathId, path, method };
}

export function getEndpointGraphNodeChange(
  endpointQueries: endpoints.GraphQueries,
  nodeId: string,
  sinceBatchCommitId?: string
): ChangeResult {
  const results = {
    added: false,
    changed: false,
    removed: false,
  };
  const deltaBatchCommits = getDeltaBatchCommitsForEndpoints(
    endpointQueries,
    sinceBatchCommitId
  );

  for (const batchCommitId of deltaBatchCommits.keys()) {
    for (const node of endpointQueries.listOutgoingNeighborsByEdgeType(
      nodeId,
      endpoints.EdgeType.CreatedIn
    ).results) {
      if (node.result.id === batchCommitId) return { ...results, added: true };
    }
    for (const node of endpointQueries.listOutgoingNeighborsByEdgeType(
      nodeId,
      endpoints.EdgeType.UpdatedIn
    ).results) {
      if (node.result.id === batchCommitId)
        return { ...results, changed: true };
    }
    for (const node of endpointQueries.listOutgoingNeighborsByEdgeType(
      nodeId,
      endpoints.EdgeType.RemovedIn
    ).results) {
      if (node.result.id === batchCommitId)
        return { ...results, removed: true };
    }
  }
  return results;
}

export function getFieldChanges(
  shapeQueries: shapes.GraphQueries,
  fieldId: string,
  shapeId: string,
  sinceBatchCommitId?: string
): ChangeResult {
  const results = {
    added: false,
    changed: false,
    removed: false,
  };

  const deltaBatchCommits = getDeltaBatchCommitsForShapes(
    shapeQueries,
    sinceBatchCommitId
  );

  for (const batchCommitId of deltaBatchCommits.keys()) {
    for (const node of shapeQueries.listOutgoingNeighborsByEdgeType(
      fieldId,
      shapes.EdgeType.CreatedIn
    ).results) {
      if (node.result.id === batchCommitId) return { ...results, added: true };
    }
  }

  // This will not deal with array item changes
  for (const batchCommitId of deltaBatchCommits.keys()) {
    for (const node of shapeQueries.listOutgoingNeighborsByEdgeType(
      fieldId,
      shapes.EdgeType.UpdatedIn
    ).results) {
      if (node.result.id === batchCommitId)
        return { ...results, changed: true };
    }
  }

  // If a field is an array, there may be changes related to the shape but not
  // the field itself.
  return checkForArrayChanges(
    shapeQueries,
    deltaBatchCommits,
    results,
    shapeId
  );
}

export function getArrayChanges(
  shapeQueries: shapes.GraphQueries,
  shapeId: string,
  sinceBatchCommitId?: string
): ChangeResult {
  const results = {
    added: false,
    changed: false,
    removed: false,
  };

  const deltaBatchCommits = getDeltaBatchCommitsForShapes(
    shapeQueries,
    sinceBatchCommitId
  );

  return checkForArrayChanges(
    shapeQueries,
    deltaBatchCommits,
    results,
    shapeId
  );
}

function checkForArrayChanges(
  shapeQueries: shapes.GraphQueries,
  deltaBatchCommits: any,
  results: ChangeResult,
  shapeId: string
): ChangeResult {
  for (const batchCommitId of deltaBatchCommits.keys()) {
    for (const node of shapeQueries.listOutgoingNeighborsByEdgeType(
      shapeId,
      shapes.EdgeType.CreatedIn
    ).results) {
      if (node.result.id === batchCommitId) return { ...results, added: true };
    }
  }

  // This will not deal with array item changes
  for (const batchCommitId of deltaBatchCommits.keys()) {
    for (const node of shapeQueries.listOutgoingNeighborsByEdgeType(
      shapeId,
      shapes.EdgeType.UpdatedIn
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
  removed: boolean;
};

function getDeltaBatchCommitsForEndpoints(
  endpointQueries: endpoints.GraphQueries,
  sinceBatchCommitId?: string
): Map<string, endpoints.BatchCommitNodeWrapper> {
  const deltaBatchCommits: Map<
    string,
    endpoints.BatchCommitNodeWrapper
  > = new Map();
  if (!sinceBatchCommitId) {
    return deltaBatchCommits;
  }

  let sortedBatchCommits = endpointQueries
    .listNodesByType(endpoints.NodeType.BatchCommit)
    .results.sort((a: any, b: any) => {
      return a.result.data.createdAt < b.result.data.createdAt ? 1 : -1;
    });
  const sinceBatchCommit: any = endpointQueries.findNodeById(
    sinceBatchCommitId
  )!;

  sortedBatchCommits
    .filter(
      (batchCommit: any) =>
        batchCommit.result.data.createdAt >
        sinceBatchCommit!.result.data.createdAt
    )
    .forEach((batchCommit: any) => {
      deltaBatchCommits.set(batchCommit.result.id, batchCommit);
    });

  return deltaBatchCommits;
}

function getDeltaBatchCommitsForShapes(
  shapeQueries: shapes.GraphQueries,
  sinceBatchCommitId?: string
): Map<string, shapes.BatchCommitNodeWrapper> {
  const deltaBatchCommits: Map<
    string,
    shapes.BatchCommitNodeWrapper
  > = new Map();
  if (!sinceBatchCommitId) {
    return deltaBatchCommits;
  }
  let sortedBatchCommits = shapeQueries
    .listNodesByType(shapes.NodeType.BatchCommit)
    .results.sort((a: any, b: any) => {
      return a.result.data.createdAt < b.result.data.createdAt ? 1 : -1;
    });
  const sinceBatchCommit: any = shapeQueries.findNodeById(sinceBatchCommitId)!;

  sortedBatchCommits
    .filter(
      (batchCommit: any) =>
        batchCommit.result.data.createdAt >
        sinceBatchCommit!.result.data.createdAt
    )
    .forEach((batchCommit: any) => {
      deltaBatchCommits.set(batchCommit.result.id, batchCommit);
    });
  return deltaBatchCommits;
}

export type ContributionsProjection = Record<string, Record<string, string>>;

export function getContributionsProjection(
  spec: any,
  opticEngine: any
): ContributionsProjection {
  return JSON.parse(opticEngine.get_contributions_projection(spec));
}

export class CommandGenerator {
  constructor(private spec: any, private opticEngine: IOpticEngine) {}
  public endpoint = {
    remove: (pathId: string, method: string): CQRSCommand[] => {
      const specEndpointDeleteCommands = this.opticEngine.spec_endpoint_delete_commands(
        this.spec,
        pathId,
        method
      );
      return JSON.parse(specEndpointDeleteCommands).commands;
    },
  };
}
