use crate::events::{EndpointEvent, SpecEvent};
use crate::state::endpoint::PathComponentId;
use cqrs_core::{Aggregate, AggregateEvent};
use petgraph::dot::Dot;
use petgraph::graph::Graph;
use std::collections::HashMap;

pub const ROOT_PATH_ID: &str = "root";

#[derive(Debug)]
pub struct PathComponentDescriptor {
  pub is_parameter: bool,
  pub name: String,
}
#[derive(Debug)]
pub enum Node {
  PathComponent(PathComponentId, PathComponentDescriptor),
}

pub enum Edge {
  IsChildOf,
}

pub struct EndpointProjection {
  pub graph: Graph<Node, Edge>,
  pub node_id_to_index: HashMap<PathComponentId, petgraph::graph::NodeIndex>,
}

impl EndpointProjection {
  pub fn with_path(
    &mut self,
    parent_path_id: PathComponentId,
    path_id: PathComponentId,
    path_name: String,
  ) {
    self.with_path_component_node(parent_path_id, path_id, path_name, false);
  }

  pub fn with_path_parameter(
    &mut self,
    parent_path_id: PathComponentId,
    path_id: PathComponentId,
    path_name: String,
  ) {
    self.with_path_component_node(parent_path_id, path_id, path_name, true);
  }

  fn with_path_component_node(
    &mut self,
    parent_path_id: PathComponentId,
    path_id: PathComponentId,
    name: String,
    is_parameter: bool,
  ) {
    let node = Node::PathComponent(
      path_id.clone(),
      PathComponentDescriptor { is_parameter, name },
    );
    let node_index = self.graph.add_node(node);
    self.node_id_to_index.insert(path_id, node_index);
    let parent_node_index = *self
      .node_id_to_index
      .get(&parent_path_id)
      .expect("expected parent_path_id to have a corresponding node");

    self
      .graph
      .add_edge(node_index, parent_node_index, Edge::IsChildOf);
  }
}

impl Default for EndpointProjection {
  fn default() -> Self {
    let root_id = String::from(ROOT_PATH_ID);
    let mut graph: Graph<Node, Edge> = Graph::new();
    let root_index = graph.add_node(Node::PathComponent(
      root_id.clone(),
      PathComponentDescriptor {
        is_parameter: false,
        name: String::from(""),
      },
    ));
    let mut node_id_to_index = HashMap::new();
    node_id_to_index.insert(root_id, root_index);

    EndpointProjection {
      graph,
      node_id_to_index,
    }
  }
}

impl Aggregate for EndpointProjection {
  fn aggregate_type() -> &'static str {
    "endpoint_projection"
  }
}

impl AggregateEvent<EndpointProjection> for SpecEvent {
  fn apply_to(self, aggregate: &mut EndpointProjection) {
    if let SpecEvent::EndpointEvent(event) = self {
      match event {
        EndpointEvent::PathComponentAdded(e) => {
          aggregate.with_path(e.parent_path_id, e.path_id, e.name);
        }
        EndpointEvent::PathParameterAdded(e) => {
          aggregate.with_path_parameter(e.parent_path_id, e.path_id, e.name)
        }
        _ => {}
      }
    }
  }
}
