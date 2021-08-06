import { GraphCommandHandler, mapAppend, NodeListWrapper } from '../shared';

export type NodeId = string;

export enum NodeType {
  Path = 'Path',
  Request = 'Request',
  QueryParameters = 'QueryParameters',
  Response = 'Response',
  Endpoint = 'Endpoint',
  Body = 'Body',
  BatchCommit = 'BatchCommit',
}

export type Node =
  | PathNode
  | RequestNode
  | ResponseNode
  | EndpointNode
  | BodyNode
  | BatchCommitNode
  | QueryParametersNode;

export type PathNode = {
  id: NodeId;
  type: NodeType.Path;
  data: {
    absolutePathPattern: string;
    pathId: string;
    name: string;
    isParameterized: boolean;
    isRemoved: boolean;
  };
};

export type RequestNode = {
  id: NodeId;
  type: NodeType.Request;
  data: {
    requestId: string;
    isRemoved: boolean;
  };
};

export type ResponseNode = {
  id: NodeId;
  type: NodeType.Response;
  data: {
    responseId: string;
    httpStatusCode: number;
    isRemoved: boolean;
  };
};

export type EndpointNode = {
  id: NodeId;
  type: NodeType.Endpoint;
  data: {
    pathId: string;
    httpMethod: string;
    id: string;
    isRemoved: boolean;
  };
};

export type BodyNode = {
  id: NodeId;
  type: NodeType.Body;
  data: {
    httpContentType: string;
    rootShapeId: string;
    isRemoved: boolean;
  };
};

export type BatchCommitNode = {
  id: NodeId;
  type: NodeType.BatchCommit;
  data: BatchCommitData;
};

export type QueryParametersNode = {
  id: NodeId;
  type: NodeType.QueryParameters;
  data: {
    queryParametersId: string;
    rootShapeId: string | null;
    httpMethod: string;
    isRemoved: boolean;
  };
};

export type BatchCommitData = {
  createdAt: string;
  batchId: string;
  commitMessage: string;
};

export type NodeWrapper =
  | BodyNodeWrapper
  | EndpointNodeWrapper
  | RequestNodeWrapper
  | ResponseNodeWrapper
  | QueryParametersNodeWrapper
  | PathNodeWrapper
  | BatchCommitNodeWrapper;

// Is there a better way of infering / mapping a type to another type?
type NodeTypeToNodeWrapper<T extends NodeType> = T extends NodeType.BatchCommit
  ? BatchCommitNodeWrapper
  : T extends NodeType.Body
  ? BodyNodeWrapper
  : T extends NodeType.Path
  ? PathNodeWrapper
  : T extends NodeType.Request
  ? RequestNodeWrapper
  : T extends NodeType.QueryParameters
  ? QueryParametersNodeWrapper
  : T extends NodeType.Response
  ? ResponseNodeWrapper
  : T extends NodeType.Endpoint
  ? EndpointNodeWrapper
  : NodeWrapper;

export enum EdgeType {
  IsChildOf = 'IsChildOf',
  CreatedIn = 'CreatedIn',
  UpdatedIn = 'UpdatedIn',
  RemovedIn = 'RemovedIn',
}

export type Edge =
  | {
      type: EdgeType.IsChildOf;
    }
  | {
      type: EdgeType.UpdatedIn;
    }
  | {
      type: EdgeType.CreatedIn;
    }
  | {
      type: EdgeType.UpdatedIn;
    };

////////////////////////////////////////////////////////////////////////////////
// A batch commit node can never be removed
const isNodeRemoved = (node: Node): boolean =>
  node.type !== NodeType.BatchCommit && node.data.isRemoved;

////////////////////////////////////////////////////////////////////////////////

export class GraphIndexer implements GraphCommandHandler<Node, NodeId, Edge> {
  readonly nodesById: Map<NodeId, Node>;
  readonly nodesByType: Map<NodeType, Node[]>;
  readonly outboundNeighbors: Map<NodeId, Map<NodeType, Node[]>>;
  readonly inboundNeighbors: Map<NodeId, Map<NodeType, Node[]>>;
  readonly outboundNeighborsByEdgeType: Map<NodeId, Map<EdgeType, Node[]>>;
  readonly inboundNeighborsByEdgeType: Map<NodeId, Map<EdgeType, Node[]>>;

  constructor() {
    this.nodesByType = new Map();
    this.nodesById = new Map();
    this.outboundNeighbors = new Map();
    this.inboundNeighbors = new Map();
    this.outboundNeighborsByEdgeType = new Map();
    this.inboundNeighborsByEdgeType = new Map();
  }

  addNode(node: Node) {
    if (this.nodesById.has(node.id)) {
      throw new Error(
        `could not add a node with an id that already exists in the graph`
      );
    }
    this.unsafeAddNode(node);
  }

  addEdge(edge: Edge, sourceNodeId: NodeId, targetNodeId: NodeId) {
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

    const outboundNeighborsByEdgeType =
      this.outboundNeighborsByEdgeType.get(sourceNodeId) || new Map();
    mapAppend(outboundNeighborsByEdgeType, edge.type, targetNode);
    this.outboundNeighborsByEdgeType.set(
      sourceNodeId,
      outboundNeighborsByEdgeType
    );

    const inboundNeighbors =
      this.inboundNeighbors.get(targetNodeId) || new Map();
    mapAppend(inboundNeighbors, sourceNode.type, sourceNode);
    this.inboundNeighbors.set(targetNodeId, inboundNeighbors);

    const inboundNeighborsByEdgeType =
      this.inboundNeighborsByEdgeType.get(targetNodeId) || new Map();
    mapAppend(inboundNeighborsByEdgeType, edge.type, sourceNode);
    this.inboundNeighborsByEdgeType.set(
      targetNodeId,
      inboundNeighborsByEdgeType
    );
  }

  unsafeAddNode(node: Node) {
    this.nodesById.set(node.id, node);
    mapAppend(this.nodesByType, node.type, node);
  }
}

////////////////////////////////////////////////////////////////////////////////

export class BodyNodeWrapper {
  constructor(public result: BodyNode, private queries: GraphQueries) {}

  get value() {
    return this.result.data;
  }

  response(): ResponseNodeWrapper | null {
    const neighbors = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Response
    );
    if (neighbors.results.length === 0) {
      return null;
    }
    return neighbors.results[0];
  }

  request(): RequestNodeWrapper | null {
    const neighbors = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Request
    );
    if (neighbors.results.length === 0) {
      return null;
    }
    return neighbors.results[0];
  }
}

export class EndpointNodeWrapper {
  constructor(public result: EndpointNode, private queries: GraphQueries) {}

  get value() {
    return this.result.data;
  }

  path() {
    const neighbors = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Path
    );
    if (neighbors.results.length === 0) {
      throw new Error(`expected endpoint to have a parent Path`);
    }
    return neighbors.results[0];
  }

  query(): QueryParametersNodeWrapper | null {
    const queryParameters = this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.QueryParameters
    );

    return queryParameters.results.length > 0
      ? queryParameters.results[0]
      : null;
  }

  requests() {
    return this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Request
    );
  }

  responses() {
    return this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Response
    );
  }
}

export class RequestNodeWrapper {
  constructor(public result: RequestNode, private queries: GraphQueries) {}

  get value() {
    return this.result.data;
  }

  // A request node can be orphaned
  endpoint(): EndpointNodeWrapper | null {
    const endpoints = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Endpoint
    );

    return endpoints.results.length > 0 ? endpoints.results[0] : null;
  }

  body(): BodyNodeWrapper | null {
    const bodies = this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Body
    );

    return bodies.results.length >= 1 ? bodies.results[0] : null;
  }
}

export class ResponseNodeWrapper {
  constructor(public result: ResponseNode, private queries: GraphQueries) {}

  get value() {
    return this.result.data;
  }

  // A response node can be orphaned
  endpoint(): EndpointNodeWrapper | null {
    const endpoints = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Endpoint
    );

    return endpoints.results.length > 0 ? endpoints.results[0] : null;
  }

  bodies() {
    return this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Body
    );
  }
}

export class QueryParametersNodeWrapper {
  constructor(
    public result: QueryParametersNode,
    private queries: GraphQueries
  ) {}

  get value() {
    return this.result.data;
  }

  // A response node can be orphaned
  endpoint(): EndpointNodeWrapper | null {
    const endpoints = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Endpoint
    );

    return endpoints.results.length > 0 ? endpoints.results[0] : null;
  }
}

export class PathNodeWrapper {
  constructor(public result: PathNode, private queries: GraphQueries) {}

  get value() {
    return this.result.data;
  }

  parentPath() {
    const parentPaths = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Path
    );
    if (parentPaths.results.length === 0) {
      return null;
    }
    const [parentPath] = parentPaths.results;
    return parentPath;
  }

  endpoints() {
    return this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Endpoint
    );
  }

  components(): PathNodeWrapper[] {
    let pathNode = this as PathNodeWrapper;
    let parentPath = pathNode.parentPath();
    const components = [pathNode];
    while (parentPath !== null) {
      components.push(parentPath);
      pathNode = parentPath;
      parentPath = pathNode.parentPath();
    }

    return components.reverse();
  }

  get absolutePathPatternWithParameterNames(): string {
    let path = '';

    const components = this.components();

    if (components.length === 1 && components[0].value.pathId === 'root') {
      return '/';
    }

    for (const component of components) {
      if (component.value.pathId === 'root') continue;
      if (component.value.isParameterized) {
        path = `${path}/{${component.value.name}}`;
      } else {
        path = `${path}/${component.value.name}`;
      }
    }

    return path;
  }
}

export class BatchCommitNodeWrapper {
  constructor(public result: BatchCommitNode, private queries: GraphQueries) {}

  get value() {
    return this.result.data;
  }

  requests() {
    return this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Request
    );
  }

  responses() {
    return this.queries.listIncomingNeighborsByType(
      this.result.id,
      NodeType.Response
    );
  }

  createdInEdgeNodes() {
    return this.queries.listIncomingNeighborsByEdgeType(
      this.result.id,
      EdgeType.CreatedIn
    );
  }

  updatedInEdgeNodes() {
    return this.queries.listIncomingNeighborsByEdgeType(
      this.result.id,
      EdgeType.UpdatedIn
    );
  }

  removedInEdgeNodes() {
    return this.queries.listIncomingNeighborsByEdgeType(
      this.result.id,
      EdgeType.RemovedIn
    );
  }
}

////////////////////////////////////////////////////////////////////////////////

export class GraphQueries {
  constructor(private index: GraphIndexer) {}

  findNodeById(id: NodeId): NodeWrapper | null {
    const node = this.index.nodesById.get(id);
    if (!node) {
      return null;
    }
    return this.wrap(node);
  }

  listNodesByType<T extends NodeType>(
    type: T,
    {
      includeRemoved = true,
    }: {
      includeRemoved?: boolean;
    } = {}
  ): NodeListWrapper<NodeTypeToNodeWrapper<T>> {
    const nodesByType = this.index.nodesByType.get(type) || [];
    const filteredNodesByType = includeRemoved
      ? nodesByType
      : nodesByType.filter((node) => !isNodeRemoved(node));
    return this.wrapList(type, filteredNodesByType) as NodeListWrapper<
      NodeTypeToNodeWrapper<T>
    >;
  }

  //@TODO add singular find* variant
  listIncomingNeighborsByType<T extends NodeType>(
    id: NodeId,
    incomingNeighborType: T,
    {
      includeRemoved = true,
    }: {
      includeRemoved?: boolean;
    } = {}
  ): NodeListWrapper<NodeTypeToNodeWrapper<T>> {
    const neighbors = this.index.inboundNeighbors.get(id);
    if (!neighbors) {
      return this.wrapList(incomingNeighborType, []) as NodeListWrapper<
        NodeTypeToNodeWrapper<T>
      >;
    }
    const neighborsOfType = neighbors.get(incomingNeighborType) || [];
    const filteredNeighborsOfType = includeRemoved
      ? neighborsOfType
      : neighborsOfType.filter((node) => !isNodeRemoved(node));

    return this.wrapList(
      incomingNeighborType,
      filteredNeighborsOfType
    ) as NodeListWrapper<NodeTypeToNodeWrapper<T>>;
  }

  //@TODO add singular find* variant
  listOutgoingNeighborsByType<T extends NodeType>(
    id: NodeId,
    outgoingNeighborType: T,
    {
      includeRemoved = true,
    }: {
      includeRemoved?: boolean;
    } = {}
  ): NodeListWrapper<NodeTypeToNodeWrapper<T>> {
    const neighbors = this.index.outboundNeighbors.get(id);
    if (!neighbors) {
      return this.wrapList(outgoingNeighborType, []) as NodeListWrapper<
        NodeTypeToNodeWrapper<T>
      >;
    }
    const neighborsOfType = neighbors.get(outgoingNeighborType) || [];
    const filteredNeighborsOfType = includeRemoved
      ? neighborsOfType
      : neighborsOfType.filter((node) => !isNodeRemoved(node));

    return this.wrapList(
      outgoingNeighborType,
      filteredNeighborsOfType
    ) as NodeListWrapper<NodeTypeToNodeWrapper<T>>;
  }

  listIncomingNeighborsByEdgeType(
    id: NodeId,
    edgeType: EdgeType
  ): NodeListWrapper<NodeWrapper> {
    const neighbors = this.index.inboundNeighborsByEdgeType.get(id);

    if (!neighbors) {
      return this.wrapList(null, []);
    }

    const neighborsOfType = neighbors.get(edgeType);

    return this.wrapList(null, neighborsOfType || []);
  }

  listOutgoingNeighborsByEdgeType(
    id: NodeId,
    edgeType: EdgeType
  ): NodeListWrapper<NodeWrapper> {
    const neighbors = this.index.outboundNeighborsByEdgeType.get(id);

    if (!neighbors) {
      return this.wrapList(null, []);
    }

    const neighborsOfType = neighbors.get(edgeType);

    return this.wrapList(null, neighborsOfType || []);
  }

  *descendantsIterator(
    nodeId: NodeId,
    seenSet: Set<NodeId> = new Set(),
    {
      includeRemoved = true,
    }: {
      includeRemoved?: boolean;
    } = {}
  ): Generator<Node> {
    const inboundNeighbors = this.index.inboundNeighbors.get(nodeId);
    if (!inboundNeighbors) {
      return;
    }
    if (seenSet.has(nodeId)) {
      return;
    }
    seenSet.add(nodeId);
    for (const neighborsByNodeType of inboundNeighbors.values()) {
      for (const neighborNode of neighborsByNodeType) {
        if (includeRemoved || !isNodeRemoved(neighborNode)) {
          yield neighborNode;
          yield* this.descendantsIterator(neighborNode.id, seenSet);
        }
      }
    }
  }

  //@TODO wrap() and wrapList() should be injected?
  // TODO figure out how to make this generic
  wrap(node: Node): NodeWrapper {
    if (node.type === NodeType.Request) {
      return new RequestNodeWrapper(node, this);
    } else if (node.type === NodeType.Response) {
      return new ResponseNodeWrapper(node, this);
    } else if (node.type === NodeType.Path) {
      return new PathNodeWrapper(node, this);
    } else if (node.type === NodeType.Body) {
      return new BodyNodeWrapper(node, this);
    } else if (node.type === NodeType.QueryParameters) {
      return new QueryParametersNodeWrapper(node, this);
    } else if (node.type === NodeType.BatchCommit) {
      return new BatchCommitNodeWrapper(node, this);
    } else if (node.type === NodeType.Endpoint) {
      return new EndpointNodeWrapper(node, this);
    }
    throw new Error(`unexpected node.type`);
  }

  //@TODO move away from null here
  // TODO figure out how to make this generic
  wrapList(type: NodeType | null, nodes: Node[]): NodeListWrapper<NodeWrapper> {
    //@TODO add list helpers (map, etc.)
    return {
      results: nodes.map((node) => this.wrap(node)),
    };
  }
}
