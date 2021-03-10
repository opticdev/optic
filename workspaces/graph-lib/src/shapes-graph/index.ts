import { GraphCommandHandler, mapAppend } from '../index';

export type NodeId = string;

export enum NodeType {
  CoreShape = 'CoreShape',
  Shape = 'Shape',
  ShapeParameter = 'ShapeParameter',
  Field = 'Field'
}

export type Node = {
  id: NodeId
} & ({
  type: NodeType.CoreShape
  data: CoreShapeNode
} | {
  type: NodeType.Shape,
  data: ShapeNode
} | {
  type: NodeType.ShapeParameter,
  data: ShapeParameterNode
} | {
  type: NodeType.Field,
  data: FieldNode
})

export type CoreShapeNode = {
  shapeId: string
  descriptor: {
    kind: string
  }
}
export type ShapeNode = {
  shapeId: string
}
export type ShapeParameterNode = {
  parameterId: string,
}
export type FieldNode = {
  fieldId: string,
  descriptor: {
    name: string
  }
}

export enum EdgeType {
  IsParameterOf = 'IsParameterOf',
  BelongsTo = 'BelongsTo',
  IsDescendantOf = 'IsDescendantOf',
  HasBinding = 'HasBinding'
}

export type Edge = {
  type: EdgeType.BelongsTo
} | {
  type: EdgeType.HasBinding
  data: {
    shapeId: string
  }
} | {
  type: EdgeType.IsDescendantOf
} | {
  type: EdgeType.IsParameterOf
}

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
      throw new Error(`could not add a node with an id that already exists in the graph`);
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

    const outboundNeighbors = this.outboundNeighbors.get(sourceNodeId) || new Map();
    mapAppend(outboundNeighbors, targetNode.type, targetNode);
    this.outboundNeighbors.set(sourceNodeId, outboundNeighbors);

    const outboundNeighborsByEdgeType = this.outboundNeighborsByEdgeType.get(sourceNodeId) || new Map();
    mapAppend(outboundNeighborsByEdgeType, edge.type, targetNode);
    this.outboundNeighborsByEdgeType.set(sourceNodeId, outboundNeighborsByEdgeType);

    const inboundNeighbors = this.inboundNeighbors.get(targetNodeId) || new Map();
    mapAppend(inboundNeighbors, sourceNode.type, sourceNode);
    this.inboundNeighbors.set(targetNodeId, inboundNeighbors);


    const inboundNeighborsByEdgeType = this.inboundNeighborsByEdgeType.get(targetNodeId) || new Map();
    mapAppend(inboundNeighborsByEdgeType, edge.type, sourceNode);
    this.inboundNeighborsByEdgeType.set(targetNodeId, inboundNeighborsByEdgeType);
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
  results: NodeWrapper[]
}

////////////////////////////////////////////////////////////////////////////////

class CoreShapeNodeWrapper implements NodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {

  }
}

class ShapeNodeWrapper implements NodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {

  }

  coreShape(): NodeWrapper {
    const coreShapeNode = this.queries.findOutgoingNeighborByEdgeType(this.result.id, EdgeType.IsDescendantOf);
    if (!coreShapeNode) {
      throw new Error(`expected node to have a core shape node`)
    }
    return coreShapeNode
  }
}

class ShapeParameterNodeWrapper implements NodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {

  }
}

class FieldNodeWrapper implements NodeWrapper {
  constructor(public result: Node, private queries: GraphQueries) {

  }
}

////////////////////////////////////////////////////////////////////////////////

export class GraphQueries {
  constructor(private index: GraphIndexer) {
  }

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
  listOutgoingNeighborsByType(id: NodeId, outgoingNeighborType: NodeType): NodeListWrapper {
    debugger
    const neighbors = this.index.outboundNeighbors.get(id);
    if (!neighbors) {
      return this.wrapList(outgoingNeighborType, []);
    }
    const neighborsOfType = neighbors.get(outgoingNeighborType);
    return this.wrapList(outgoingNeighborType, neighborsOfType || []);
  }


  findOutgoingNeighborByEdgeType(id: NodeId, edgeType: EdgeType): NodeWrapper | null {
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

  //@TODO wrap() and wrapList() should be injected?
  wrap(node: Node): NodeWrapper {
    if (node.type === NodeType.CoreShape) {
      return new CoreShapeNodeWrapper(node, this);
    } else if (node.type === NodeType.Shape) {
      return new ShapeNodeWrapper(node, this);
    } else if (node.type === NodeType.ShapeParameter) {
      return new ShapeParameterNodeWrapper(node, this);
    } else if (node.type === NodeType.Field) {
      return new FieldNodeWrapper(node, this);
    }
    throw new Error(`unexpected node.type`);
  }

  wrapList(type: NodeType, nodes: Node[]): NodeListWrapper {
    //@TODO add list helpers (map, etc.)
    return {
      results: nodes.map(node => this.wrap(node))
    };
  }
}