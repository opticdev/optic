import { shapes, endpoints } from '@useoptic/graph-lib';
import { CQRSCommand, JsonType } from '@useoptic/optic-domain';
import { IOpticEngine, IOpticEngineIdGenerationStrategy } from './types';

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
    // In this case specifically, we want _all_ endpoint changes
    sinceBatchCommitId || ALL_BATCH_COMMITS
  );

  const changes = new Changes();

  for (const [_, batchCommit] of deltaBatchCommits) {
    for (const { edgeType, nodes } of [
      { edgeType: 'created', nodes: batchCommit.createdInEdgeNodes().results },
      { edgeType: 'updated', nodes: batchCommit.updatedInEdgeNodes().results },
      { edgeType: 'removed', nodes: batchCommit.removedInEdgeNodes().results },
    ]) {
      for (const node of nodes) {
        if (
          node instanceof endpoints.RequestNodeWrapper ||
          node instanceof endpoints.ResponseNodeWrapper ||
          node instanceof endpoints.QueryParametersNodeWrapper
        ) {
          const endpoint = node.endpoint();
          if (endpoint) {
            let changeType: ChangeCategory = 'updated';
            if (
              node instanceof endpoints.RequestNodeWrapper &&
              edgeType === 'created'
            ) {
              changeType = 'added';
            } else if (
              node instanceof endpoints.RequestNodeWrapper &&
              edgeType === 'removed'
            ) {
              changeType = 'removed';
            }
            changes.captureChange(changeType, endpoint);
          }
        }
      }
    }
  }

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

  // Both body nodes and query parameter nodes have rootShapeIds
  const rootShapesWithEndpoint: {
    rootShapeId: string;
    endpoint: endpoints.EndpointNodeWrapper;
  }[] = [];

  for (const bodyNode of endpointQueries.listNodesByType(
    endpoints.NodeType.Body
  ).results) {
    const rootShapeId = bodyNode.value.rootShapeId;
    const endpoint =
      bodyNode.response()?.endpoint() || bodyNode.request()?.endpoint();
    if (endpoint) {
      rootShapesWithEndpoint.push({
        rootShapeId,
        endpoint,
      });
    }
  }

  for (const queryParamaterNode of endpointQueries.listNodesByType(
    endpoints.NodeType.QueryParameters
  ).results) {
    const rootShapeId = queryParamaterNode.value.rootShapeId;
    const endpoint = queryParamaterNode.endpoint();

    if (endpoint && rootShapeId) {
      rootShapesWithEndpoint.push({
        rootShapeId,
        endpoint,
      });
    }
  }

  const filteredRootShapesWithEndpoint = rootShapesWithEndpoint.filter(
    ({ rootShapeId }) => {
      if (batchCommitNeighborIds.has(rootShapeId)) {
        return true;
      }
      // TODO this does not handle array children and polymorphic type changes
      for (const descendant of shapeQueries.descendantsIterator(rootShapeId)) {
        if (batchCommitNeighborIds.has(descendant.id)) {
          return true;
        }
      }
      return false;
    }
  );

  filteredRootShapesWithEndpoint.forEach(({ endpoint }) => {
    changes.captureChange('updated', endpoint);
  });

  return changes.toEndpointChanges();
}

type ChangeCategory = 'added' | 'updated' | 'removed';

class Changes {
  public changes: Map<string, EndpointChange>;

  constructor() {
    this.changes = new Map();
  }

  captureChange(
    category: ChangeCategory,
    endpoint: endpoints.EndpointNodeWrapper
  ): boolean {
    if (this.changes.has(endpoint.value.id)) return false;
    this.changes.set(endpoint.value.id, {
      change: { category },
      pathId: endpoint.path().value.pathId,
      path: endpoint.path().absolutePathPatternWithParameterNames,
      method: endpoint.value.httpMethod,
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

const ALL_BATCH_COMMITS = 'ALL_BATCH_COMMITS';

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
        sinceBatchCommitId === ALL_BATCH_COMMITS ||
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
        sinceBatchCommitId === ALL_BATCH_COMMITS ||
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

  public field = {
    remove: (fieldId: string): CQRSCommand[] => {
      const fieldRemovalCommands = this.opticEngine.spec_field_remove_commands(
        this.spec,
        fieldId
      );
      return JSON.parse(fieldRemovalCommands);
    },
    edit: (fieldId: string, requestedTypes: JsonType[]): CQRSCommand[] => {
      const fieldEditCommands = this.opticEngine.spec_field_edit_commands(
        this.spec,
        fieldId,
        requestedTypes,
        IOpticEngineIdGenerationStrategy.UNIQUE
      );

      return JSON.parse(fieldEditCommands);
    },
  };
}
