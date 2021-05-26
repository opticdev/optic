import { GraphCommandHandler, mapAppend } from '../index';

export type NodeId = string;

export enum NodeType {
  Path = 'Path',
  Request = 'Request',
  Response = 'Response',
  Body = 'Body',
  BatchCommit = 'BatchCommit',
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
  | {
      type: NodeType.BatchCommit;
      data: BatchCommitNode;
    }
);

export type PathNode = {
  absolutePathPattern: string;
  pathId: string;
  name: string;
  isParameterized: boolean;
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

export type BatchCommitNode = {
  createdAt: string;
  batchId: string;
  commitMessage: string;
};

////////////////////////////////////////////////////////////////////////////////

export class GraphIndexer implements GraphCommandHandler<Node, NodeId> {
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

////////////////////////////////////////////////////////////////////////////////

// @TODO: this should be generic so we can do wrap<T> and know what type to expect?
export interface NodeWrapper {
  result: Node;
}

export interface NodeListWrapper {
  results: NodeWrapper[];
}

////////////////////////////////////////////////////////////////////////////////

export class BodyNodeWrapper implements NodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {}

  response(): ResponseNodeWrapper | null {
    const neighbors = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Response
    );
    if (neighbors.results.length === 0) {
      return null;
    }
    return neighbors.results[0] as ResponseNodeWrapper;
  }

  request(): RequestNodeWrapper | null {
    const neighbors = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Request
    );
    if (neighbors.results.length === 0) {
      return null;
    }
    return neighbors.results[0] as RequestNodeWrapper;
  }
}

export class RequestNodeWrapper implements NodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {}

  get value(): RequestNode {
    return this.result.data as RequestNode;
  }

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

  responses(): ResponseNodeWrapper[] {
    return (this.path().responses() as any).results.filter(
      (response: any) => response.value.httpMethod === this.value.httpMethod
    );
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

  get value(): ResponseNode {
    return this.result.data as ResponseNode;
  }

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

  get value(): PathNode {
    return this.result.data as PathNode;
  }

  parentPath(): PathNodeWrapper | null {
    const parentPaths = this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.Path
    );
    if (parentPaths.results.length === 0) {
      return null;
    }
    const [parentPath] = parentPaths.results;
    return parentPath as PathNodeWrapper;
  }

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

export class BatchCommitNodeWrapper implements NodeWrapper {
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

  *descendantsIterator(
    nodeId: NodeId,
    seenSet: Set<NodeId> = new Set()
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
        yield neighborNode;
        yield* this.descendantsIterator(neighborNode.id, seenSet);
      }
    }
  }

  //@TODO wrap() and wrapList() should be injected?
  wrap(node: Node): NodeWrapper {
    if (node.type === NodeType.Request) {
      return new RequestNodeWrapper(node, this);
    } else if (node.type === NodeType.Response) {
      return new ResponseNodeWrapper(node, this);
    } else if (node.type === NodeType.Path) {
      return new PathNodeWrapper(node, this);
    } else if (node.type === NodeType.Body) {
      return new BodyNodeWrapper(node, this);
    } else if (node.type === NodeType.BatchCommit) {
      return new BatchCommitNodeWrapper(node, this);
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
