use crate::events::{ShapeEvent, SpecEvent};
use crate::state::shape::{
    FieldId, ShapeId, ShapeIdRef, ShapeKind, ShapeKindDescriptor, ShapeParameterId,
    ShapeParameterIdRef, ShapeParametersDescriptor,
};
use cqrs_core::{Aggregate, AggregateEvent};
use petgraph::graph::{Graph, NodeIndex};
use petgraph::visit::EdgeRef;
use std::collections::HashMap;

#[derive(Debug)]
pub enum Node {
    CoreShape(ShapeNode),
    Shape(ShapeNode),
    Field(FieldNode),
    ShapeParameter(ShapeParameterNode),
}

#[derive(Debug)]
pub struct ShapeNode(ShapeId, ShapeNodeDescriptor);
#[derive(Debug)]
pub struct FieldNode(FieldId, FieldNodeDescriptor);
#[derive(Debug)]
pub struct ShapeParameterNode(ShapeParameterId, ShapeParameterNodeDescriptor);

#[derive(Debug)]
pub enum Edge {
    IsDescendantOf,
    IsFieldOf,
    IsParameterOf,
}

pub type NodeId = String;

#[derive(Debug)]
pub struct ShapeNodeDescriptor {}
#[derive(Debug)]
pub struct ShapeParameterNodeDescriptor {}

#[derive(Debug)]
pub struct FieldNodeDescriptor {}

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
        add_core_shape_to_projection(&mut projection, ShapeKind::ListKind);
        projection
    }
}

fn add_core_shape_to_projection(shape_projection: &mut ShapeProjection, shape_kind: ShapeKind) {
    let descriptor = shape_kind.get_descriptor();
    let shape_node = Node::CoreShape(ShapeNode(
        ShapeId::from(descriptor.base_shape_id),
        ShapeNodeDescriptor {},
    ));
    let shape_node_index = shape_projection.graph.add_node(shape_node);
    shape_projection
        .node_id_to_index
        .insert(String::from(descriptor.base_shape_id), shape_node_index);
    if let Some(shape_parameter_descriptor) = shape_kind.get_parameter_descriptor() {
        let shape_parameter_node = Node::ShapeParameter(ShapeParameterNode(
            String::from(shape_parameter_descriptor.shape_parameter_id),
            ShapeParameterNodeDescriptor {},
        ));
        let shape_parameter_node_index = shape_projection.graph.add_node(shape_parameter_node);
        shape_projection.node_id_to_index.insert(
            String::from(shape_parameter_descriptor.shape_parameter_id),
            shape_parameter_node_index,
        );
        shape_projection.graph.add_edge(
            shape_parameter_node_index,
            shape_node_index,
            Edge::IsParameterOf,
        );
    }
}

impl ShapeProjection {
    pub fn with_shape(
        &mut self,
        shape_id: ShapeId,
        base_shape_id: ShapeId,
        parameters: ShapeParametersDescriptor,
        name: String,
    ) {
        let shape_node = Node::Shape(ShapeNode(shape_id.clone(), ShapeNodeDescriptor {}));
        let shape_node_index = self.graph.add_node(shape_node);
        self.node_id_to_index.insert(shape_id, shape_node_index);

        let base_shape_node_index = self
            .node_id_to_index
            .get(&base_shape_id)
            .expect("expected base_shape_id to have a corresponding node");
        self.graph.add_edge(
            shape_node_index,
            *base_shape_node_index,
            Edge::IsDescendantOf,
        );
    }

    pub fn get_shape_node_index(&self, node_id: &NodeId) -> Option<&NodeIndex> {
        let node_index = self.node_id_to_index.get(node_id)?;
        let node = self.graph.node_weight(*node_index);
        match node {
            Some(&Node::Shape(node)) | Some(&Node::CoreShape(node)) => Some(node_index),
            Some(_) => None,
            None => None,
        }
    }

    pub fn get_descendant_shape_node_index(
        &self,
        parent_node_index: &NodeIndex,
        child_id: &NodeId,
    ) -> Option<NodeIndex> {
        let mut edges = self
            .graph
            .edges_directed(*parent_node_index, petgraph::Direction::Incoming);
        let child_edge = edges.find(|edge| match edge.weight() {
            Edge::IsDescendantOf => match self.graph.node_weight(edge.source()) {
                Some(Node::Shape(ShapeNode(neighbour_id, _)))
                | Some(Node::CoreShape(ShapeNode(neighbour_id, _))) => *child_id == *neighbour_id,
                _ => false,
            },
            _ => false,
        })?;

        Some(child_edge.source())
    }

    // TODO: get some help on why the signature below doesn't work, (expected type parameter `T`, found struct `std::iter::FilterMap`)
    // "expected type parameter `T`, found struct `std::iter::FilterMap`", but FilterMap implements Iterator?
    // (`impl Iterator...` won't work, as we need to assign the iterator a lifetime to be at least as long as the struct)
    // pub fn get_core_shape_nodes<'a, T>(&'a self, node_index: &NodeIndex) -> Option<T>
    // where
    //     T: Iterator<Item = &'a ShapeNode>,
    //     T: 'a,
    // {
    pub fn get_core_shape_nodes(self, node_index: &NodeIndex) -> Option<Vec<&ShapeNode>> {
        let node = self.graph.node_weight(*node_index);
        if let Some(Node::Shape(shape_node)) = node {
            let neighbours = self
                .graph
                .neighbors_directed(*node_index, petgraph::Direction::Outgoing);
            let core_shapes = neighbours.filter_map(|neighbour_index| {
                if let Some(Node::CoreShape(node)) = self.graph.node_weight(neighbour_index.clone())
                {
                    Some(node)
                } else {
                    None
                }
            });
            .collect();
            Some(core_shapes)
        } else {
            None
        }
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
