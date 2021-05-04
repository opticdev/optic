import * as endpoints from './endpoints-graph';
import * as shapes from './shapes-graph';

export {
  endpoints,
  shapes
};

////////////////////////////////////////////////////////////////////////////////

export interface GraphCommandHandler<N, I, E = any> {
  addNode(node: N): void;

  addEdge(edge: E, sourceNodeId: I, targetNodeId: I): void;
}

////////////////////////////////////////////////////////////////////////////////

export function mapAppend<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const values = map.get(key) || [];
  values.push(value);
  map.set(key, values);
}

////////////////////////////////////////////////////////////////////////////////
