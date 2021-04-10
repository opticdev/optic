import { shapes, endpoints } from '@useoptic/graph-lib';

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

type EndpointChanges = {
  data: {
    endpoints: {
      change: {
        category: string;
      };
      path: string;
      method: string;
    }[];
  };
};

export function buildEndpointChanges(
  queries: endpoints.GraphQueries,
  since?: string
): EndpointChanges {
  let sortedBatchCommits = queries
    .listNodesByType(endpoints.NodeType.BatchCommit)
    .results.sort((a: any, b: any) => {
      return a.result.data.createdAt < b.result.data.createdAt ? 1 : -1;
    });

  // If there is no `since` date, we want to use every batch commit
  const deltaBatchCommits = since
    ? sortedBatchCommits.filter(
      (batchCommit: any) => batchCommit.result.data.createdAt > since
    )
    : sortedBatchCommits;

  const changes = new Map();

  // Go through requests first. When we go through responses second, we can check
  // to see if the endpoint has been added by a request existing in the batch commits.
  // If the endpoint exists, we can ignore since it's already there. Otherwise we
  // can say the endpoint was updated.
  deltaBatchCommits.forEach((batchCommit: any) => {
    batchCommit.requests().results.forEach((request: any) => {
      const path = request.path().result.data.absolutePathPattern;
      const method = request.result.data.httpMethod;
      const endpointId = JSON.stringify({ path, method });

      // We can always assume a new request means a new endpoint
      changes.set(endpointId, {
        change: {
          category: 'added'
        },
        path,
        method
      });
    });

    batchCommit.responses().results.forEach((response: any) => {
      const pathNode = response.path();
      const path = pathNode.result.data.absolutePathPattern;
      const method = response.result.data.httpMethod;
      const endpointId = JSON.stringify({ path, method });

      // If the endpoint is there, we should ignore this change
      // We can then assume if the endpoint does not exist, it means
      // this endpoint should be marked as updated.
      if (changes.has(endpointId)) return;

      changes.set(endpointId, {
        change: {
          category: 'updated'
        },
        path,
        method
      });
    });
  });

  return {
    data: {
      endpoints: Array.from(changes.values())
    }
  } as EndpointChanges;
}