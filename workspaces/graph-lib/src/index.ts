export type NodeId = string;

export enum NodeType {
  Path = 'Path',
  Request = 'Request',
  Response = 'Response',
  Body = 'Body',
}

export type Node = {
  id: NodeId;
} & (
  | {
      type: NodeType.Path;
      data: PathNode;
    }
  | {
      type: NodeType.Request;
      data: RequestNode;
    }
  | {
      type: NodeType.Response;
      data: ResponseNode;
    }
  | {
      type: NodeType.Body;
      data: BodyNode;
    }
);

export type PathNode = {
  absolutePathPattern: string;
  pathId: string;
};
export type RequestNode = {
  requestId: string;
  httpMethod: string;
};
export type ResponseNode = {
  responseId: string;
  httpMethod: string;
  httpStatusCode: number;
};

export type BodyNode = {
  httpContentType: string;
  rootShapeId: string;
};

////////////////////////////////////////////////////////////////////////////////
export interface GraphCommandHandler {
  addNode(node: Node): void;

  addEdge(edge: any, sourceNodeId: NodeId, targetNodeId: NodeId): void;
}

////////////////////////////////////////////////////////////////////////////////

export function mapAppend<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const values = map.get(key) || [];
  values.push(value);
  map.set(key, values);
}

////////////////////////////////////////////////////////////////////////////////

export class GraphIndexer implements GraphCommandHandler {
  readonly nodesById: Map<NodeId, Node>;
  readonly nodesByType: Map<NodeType, Node[]>;
  readonly outboundNeighbors: Map<NodeId, Map<NodeType, Node[]>>;
  readonly inboundNeighbors: Map<NodeId, Map<NodeType, Node[]>>;

  constructor() {
    this.nodesByType = new Map();
    this.nodesById = new Map();
    this.outboundNeighbors = new Map();
    this.inboundNeighbors = new Map();
  }

  addNode(node: Node) {
    if (this.nodesById.has(node.id)) {
      throw new Error(
        `could not add a node with an id that already exists in the graph`
      );
    }
    this.unsafeAddNode(node);
  }

  addEdge(edge: any, sourceNodeId: NodeId, targetNodeId: NodeId) {
    const sourceNode = this.nodesById.get(sourceNodeId);
    if (!sourceNode) {
      throw new Error(`expected ${sourceNodeId} to exist`);
    }

    const targetNode = this.nodesById.get(targetNodeId);
    if (!targetNode) {
      throw new Error(`expected ${targetNodeId} to exist`);
    }

    const outboundNeighbors =
      this.outboundNeighbors.get(sourceNodeId) || new Map();
    mapAppend(outboundNeighbors, targetNode.type, targetNode);
    this.outboundNeighbors.set(sourceNodeId, outboundNeighbors);

    const inboundNeighbors =
      this.inboundNeighbors.get(targetNodeId) || new Map();
    mapAppend(inboundNeighbors, sourceNode.type, sourceNode);
    this.inboundNeighbors.set(targetNodeId, inboundNeighbors);
  }

  unsafeAddNode(node: Node) {
    this.nodesById.set(node.id, node);
    mapAppend(this.nodesByType, node.type, node);
  }
}

// this should be generic so we can do wrap<T> and know what type to expect?
export interface NodeWrapper {
  result: Node;
}

export class RequestNodeWrapper implements NodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {}

  path(): PathNodeWrapper {
    const neighbors = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Path
    );
    if (neighbors.results.length === 0) {
      throw new Error(`expected Request to have a parent Path`);
    }
    return neighbors.results[0] as PathNodeWrapper;
  }

  bodies(): NodeListWrapper {
    return this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Body
    );
  }
}

export class ResponseNodeWrapper implements NodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {}

  path(): PathNodeWrapper {
    const neighbors = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Path
    );
    if (neighbors.results.length === 0) {
      throw new Error(`expected Response to have a parent Path`);
    }
    return neighbors.results[0] as PathNodeWrapper;
  }

  bodies(): NodeListWrapper {
    return this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Body
    );
  }
}

export class PathNodeWrapper implements NodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {}

  requests(): NodeListWrapper {
    return this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Request
    );
  }

  responses(): NodeListWrapper {
    return this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Response
    );
  }
}

export interface NodeListWrapper {
  results: NodeWrapper[];
}

export class GraphQueries {
  constructor(private index: GraphIndexer) {}

  findById(id: NodeId): NodeWrapper | null {
    const node = this.index.nodesById.get(id);
    if (!node) {
      return null;
    }
    return this.wrap(node);
  }

  listNodesByType(type: NodeType): NodeListWrapper {
    return this.wrapList(type, this.index.nodesByType.get(type) || []);
  }

  //@TODO add singular find* variant
  listIncomingNeighborsByType(id: NodeId, incomingNeighborType: NodeType) {
    const neighbors = this.index.inboundNeighbors.get(id);
    if (!neighbors) {
      return this.wrapList(incomingNeighborType, []);
    }
    const neighborsOfType = neighbors.get(incomingNeighborType);
    return this.wrapList(incomingNeighborType, neighborsOfType || []);
  }

  //@TODO add singular find* variant
  listOutgoingNeighborsByType(
    id: NodeId,
    outgoingNeighborType: NodeType
  ): NodeListWrapper {
    const neighbors = this.index.outboundNeighbors.get(id);
    if (!neighbors) {
      return this.wrapList(outgoingNeighborType, []);
    }
    const neighborsOfType = neighbors.get(outgoingNeighborType);
    return this.wrapList(outgoingNeighborType, neighborsOfType || []);
  }

  wrap(node: Node): NodeWrapper {
    if (node.type === NodeType.Request) {
      return new RequestNodeWrapper(node, this);
    } else if (node.type === NodeType.Response) {
      return new ResponseNodeWrapper(node, this);
    } else if (node.type === NodeType.Path) {
      return new PathNodeWrapper(node, this);
    } else if (node.type === NodeType.Body) {
      return { result: node };
    }
    throw new Error(`unexpected node.type`);
  }

  wrapList(type: NodeType, nodes: Node[]): NodeListWrapper {
    //@TODO add list helpers (map, etc.)
    return {
      results: nodes.map((node) => this.wrap(node)),
    };
  }
}
