import { GraphCommandHandler, mapAppend, NodeListWrapper } from '../shared';
import { BatchCommitData } from '../endpoints-graph';

export type NodeId = string;

export enum NodeType {
  CoreShape = 'CoreShape',
  Shape = 'Shape',
  ShapeParameter = 'ShapeParameter',
  Field = 'Field',
  BatchCommit = 'BatchCommit',
}

export type Node =
  | CoreShapeNode
  | ShapeNode
  | ShapeParameterNode
  | FieldNode
  | BatchCommitNode;

type CoreShapeNode = {
  id: NodeId;
  type: NodeType.CoreShape;
  data: {
    shapeId: string;
    descriptor: {
      kind: string;
    };
  };
};

type ShapeNode = {
  id: NodeId;
  type: NodeType.Shape;
  data: {
    shapeId: string;
  };
};

type ShapeParameterNode = {
  id: NodeId;
  type: NodeType.ShapeParameter;
  data: {
    parameterId: string;
  };
};

type FieldNode = {
  id: NodeId;
  type: NodeType.Field;
  data: {
    fieldId: string;
    descriptor: {
      name: string;
    };
    isRemoved: boolean; // TODO check that this is returned as we expect
  };
};

type BatchCommitNode = {
  id: NodeId;
  type: NodeType.BatchCommit;
  data: BatchCommitData;
};

export type NodeWrapper =
  | CoreShapeNodeWrapper
  | ShapeNodeWrapper
  | ShapeParameterNodeWrapper
  | FieldNodeWrapper
  | BatchCommitNodeWrapper;

// Is there a better way of infering / mapping a type to another type?
type NodeTypeToNodeWrapper<T extends NodeType> = T extends NodeType.BatchCommit
  ? BatchCommitNodeWrapper
  : T extends NodeType.Shape
  ? ShapeNodeWrapper
  : T extends NodeType.ShapeParameter
  ? ShapeParameterNodeWrapper
  : T extends NodeType.CoreShape
  ? CoreShapeNodeWrapper
  : T extends NodeType.Field
  ? FieldNodeWrapper
  : NodeWrapper;

export enum EdgeType {
  IsParameterOf = 'IsParameterOf',
  BelongsTo = 'BelongsTo',
  IsDescendantOf = 'IsDescendantOf',
  HasBinding = 'HasBinding',
  CreatedIn = 'CreatedIn',
  UpdatedIn = 'UpdatedIn',
  RemovedIn = 'RemovedIn',
}

export type Edge =
  | {
      type: EdgeType.BelongsTo;
    }
  | {
      type: EdgeType.HasBinding;
      data: {
        shapeId: string;
      };
    }
  | {
      type: EdgeType.IsDescendantOf;
    }
  | {
      type: EdgeType.IsParameterOf;
    }
  | {
      type: EdgeType.CreatedIn;
    }
  | {
      type: EdgeType.UpdatedIn;
    }
  | {
      type: EdgeType.RemovedIn;
    };

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

export class CoreShapeNodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {}
}

export class ShapeNodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {}

  coreShape(): NodeWrapper {
    const coreShapeNode = this.queries.findOutgoingNeighborByEdgeType(
      this.result.id,
      EdgeType.IsDescendantOf
    );
    if (!coreShapeNode) {
      throw new Error(`expected node to have a core shape node`);
    }
    return coreShapeNode;
  }

  batchCommits() {
    return this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.BatchCommit
    );
  }
}

export class ShapeParameterNodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {}
}

export class FieldNodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {}

  batchCommits() {
    return this.queries.listOutgoingNeighborsByType(
      this.result.id,
      NodeType.BatchCommit
    );
  }
}

export class BatchCommitNodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {}
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
    type: T
  ): NodeListWrapper<NodeTypeToNodeWrapper<T>> {
    return this.wrapList(
      type,
      this.index.nodesByType.get(type) || []
    ) as NodeListWrapper<NodeTypeToNodeWrapper<T>>;
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
  listOutgoingNeighborsByType<T extends NodeType>(
    id: NodeId,
    outgoingNeighborType: T
  ): NodeListWrapper<NodeTypeToNodeWrapper<T>> {
    debugger;
    const neighbors = this.index.outboundNeighbors.get(id);
    if (!neighbors) {
      return this.wrapList(outgoingNeighborType, []) as NodeListWrapper<
        NodeTypeToNodeWrapper<T>
      >;
    }
    const neighborsOfType = neighbors.get(outgoingNeighborType);
    return this.wrapList(
      outgoingNeighborType,
      neighborsOfType || []
    ) as NodeListWrapper<NodeTypeToNodeWrapper<T>>;
  }

  findOutgoingNeighborByEdgeType(
    id: NodeId,
    edgeType: EdgeType
  ): NodeWrapper | null {
    const neighbors = this.index.outboundNeighborsByEdgeType.get(id);
    if (!neighbors) {
      return null;
    }
    const neighborsOfType = neighbors.get(edgeType);
    if (!neighborsOfType) {
      return null;
    }
    return this.wrap(neighborsOfType[0]);
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

  //@TODO wrap() and wrapList() should be injected?
  // TODO figure out how to make this generic
  wrap(node: Node): NodeWrapper {
    if (node.type === NodeType.CoreShape) {
      return new CoreShapeNodeWrapper(node, this);
    } else if (node.type === NodeType.Shape) {
      return new ShapeNodeWrapper(node, this);
    } else if (node.type === NodeType.ShapeParameter) {
      return new ShapeParameterNodeWrapper(node, this);
    } else if (node.type === NodeType.Field) {
      return new FieldNodeWrapper(node, this);
    } else if (node.type === NodeType.BatchCommit) {
      return new BatchCommitNodeWrapper(node, this);
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
