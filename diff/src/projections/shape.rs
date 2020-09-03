use crate::events::{ShapeEvent, SpecEvent};
use crate::state::shape::{
    FieldId, ShapeId, ShapeIdRef, ShapeKind, ShapeKindDescriptor, ShapeParameterId,
    ShapeParameterIdRef, ShapeParametersDescriptor,
};
use cqrs_core::{Aggregate, AggregateEvent};
use petgraph::graph::{Graph, NodeIndex};
use std::collections::HashMap;

#[derive(Debug)]
pub enum Node {
    CoreShape(ShapeId, ShapeDescriptor),
    Shape(ShapeId, ShapeDescriptor),
    Field(FieldId, FieldDescriptor),
    ShapeParameter(ShapeParameterId, ShapeParametersDescriptor),
}

#[derive(Debug)]
pub enum Edge {
    IsDescendantOf,
    IsFieldOf,
    IsParameterOf,
}

#[derive(Hash, PartialEq, Eq)]
pub enum NodeId {
    ShapeId(ShapeId),
    ShapeParameterId(ShapeParameterId),
    FieldId(FieldId),
}

#[derive(Debug)]
pub struct ShapeDescriptor {}

#[derive(Debug)]
pub struct FieldDescriptor {}

pub struct ShapeProjection {
    pub graph: Graph<Node, Edge>,
    pub node_id_to_index: HashMap<NodeId, petgraph::graph::NodeIndex>,
}

impl Default for ShapeProjection {
    fn default() -> Self {
        let graph: Graph<Node, Edge> = Graph::new();
        let node_id_to_index = HashMap::new();
        let mut projection = ShapeProjection {
            graph,
            node_id_to_index,
        };

        add_core_shape_to_projection(&mut projection, ShapeKind::StringKind);
        add_core_shape_to_projection(&mut projection, ShapeKind::NumberKind);
        add_core_shape_to_projection(&mut projection, ShapeKind::BooleanKind);
        projection
    }
}

fn add_core_shape_to_projection(shape_projection: &mut ShapeProjection, shape_kind: ShapeKind) {
    let descriptor = ShapeKind::get_descriptor(&shape_kind);
    let shape_node = Node::CoreShape(ShapeId::from(descriptor.base_shape_id), ShapeDescriptor {});
    let node_index = shape_projection.graph.add_node(shape_node);
    shape_projection.node_id_to_index.insert(
        NodeId::ShapeId(ShapeId::from(descriptor.base_shape_id)),
        node_index,
    );
}

impl ShapeProjection {
    pub fn with_shape(
        &mut self,
        shape_id: ShapeId,
        base_shape_id: ShapeId,
        parameters: ShapeParametersDescriptor,
        name: String,
    ) {
        let shape_node = Node::Shape(shape_id.clone(), ShapeDescriptor {});
        let shape_node_index = self.graph.add_node(shape_node);
        let shape_node_id = NodeId::ShapeId(shape_id);
        self.node_id_to_index
            .insert(shape_node_id, shape_node_index);

        let base_shape_node_index = self
            .node_id_to_index
            .get(&NodeId::ShapeId(base_shape_id))
            .expect("expected base_shape_id to have a corresponding node");
        self.graph.add_edge(
            shape_node_index,
            *base_shape_node_index,
            Edge::IsDescendantOf,
        );
    }
}

impl Aggregate for ShapeProjection {
    fn aggregate_type() -> &'static str {
        "shape_projection"
    }
}

impl AggregateEvent<ShapeProjection> for ShapeEvent {
    fn apply_to(self, projection: &mut ShapeProjection) {
        match self {
            ShapeEvent::ShapeAdded(e) => {
                projection.with_shape(e.shape_id, e.base_shape_id, e.parameters, e.name)
            }
            _ => {} // TODO: eventually add logging for any ShapeEvent we don't use for this projection for some reason
        }
    }
}

impl AggregateEvent<ShapeProjection> for SpecEvent {
    fn apply_to(self, projection: &mut ShapeProjection) {
        if let SpecEvent::ShapeEvent(event) = self {
            event.apply_to(projection);
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use serde_json;

    #[test]
    fn can_project_shape_added_for_core_shape_ids() {
        let event : ShapeEvent = serde_json::from_str(r#"
            {"ShapeAdded":{"shapeId":"EQSZqM_13","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"","eventContext":{"clientId":"anonymous","clientSessionId":"051c1e18-9cce-4f70-97c2-831dec850d0c","clientCommandBatchId":"ee02a716-7a3a-43d2-b1b2-b0a8259f071f","createdAt":"2020-04-08T09:23:41.638Z"}}}
        "#).expect("should deserialize json spec event");

        let mut projection = ShapeProjection::default();
        projection.apply(event);
    }
}
