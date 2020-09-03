pub use crate::events::{ShapeEvent, SpecEvent};
pub use crate::state::shape::{
    FieldId, ShapeId, ShapeIdRef, ShapeKind, ShapeKindDescriptor, ShapeParameterId,
    ShapeParameterIdRef,
};
pub use petgraph::graph::{Graph, NodeIndex};
use std::collections::HashMap;

#[derive(Debug)]
pub enum Node {
    CoreShape(ShapeIdRef<'static>, ShapeDescriptor),
    Shape(ShapeId, ShapeDescriptor),
    Field(FieldId, FieldDescriptor),
    ShapeParameter(ShapeParameterId, ShapeParameterDescriptor),
}

#[derive(Debug)]
pub enum Edge {
    IsDescendantOf,
    IsFieldOf,
    IsParameterOf,
}

#[derive(Hash, PartialEq, Eq)]
pub enum NodeId<'a> {
    ShapeId(ShapeId),
    ShapeIdRef(ShapeIdRef<'a>),
    ShapeParameterId(ShapeParameterId),
    ShapeParameterIdRef(ShapeParameterIdRef<'a>),
    FieldId(FieldId),
}

pub struct ShapeProjection<'a> {
    pub graph: Graph<Node, Edge>,
    pub node_id_to_index: HashMap<NodeId<'a>, petgraph::graph::NodeIndex>,
}

impl<'a> Default for ShapeProjection<'a> {
    fn default() -> Self {
        let mut graph: Graph<Node, Edge> = Graph::new();
        let mut node_id_to_index = HashMap::new();
        let mut projection = ShapeProjection {
            graph,
            node_id_to_index,
        };

        add_core_shape_to_projection(&mut projection, ShapeKind::StringKind);
        add_core_shape_to_projection(&mut projection, ShapeKind::NumberKind);
        projection
    }
}

fn add_core_shape_to_projection<'a>(shape_projection: &'a mut ShapeProjection, shape_kind: ShapeKind) {
  let descriptor = ShapeKind::get_descriptor(&shape_kind);
  let shape_node =
      Node::CoreShape(descriptor.base_shape_id, ShapeDescriptor {});
  let node_index = shape_projection.graph.add_node(shape_node);
  shape_projection.node_id_to_index.insert(NodeId::ShapeIdRef(descriptor.base_shape_id), node_index);
}

#[derive(Debug)]
pub struct ShapeDescriptor {}

#[derive(Debug)]
pub struct FieldDescriptor {}

#[derive(Debug)]
pub struct ShapeParameterDescriptor {}
