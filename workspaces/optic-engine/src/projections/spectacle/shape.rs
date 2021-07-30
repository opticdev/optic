use crate::projections::shape::{Edge, Node, ShapeProjection};
use crate::queries::spectacle::spec_choices::{ShapeChoice, ShapeChoiceQueries};
use crate::shapes::ShapeTrail;
use crate::state::shape::ShapeId;
use serde::Serialize;
use std::collections::BTreeMap;
use std::iter::FromIterator;

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GraphNodesAndEdges<N, E> {
  nodes: Vec<N>,
  edges: Vec<(usize, usize, E)>,
  node_index_to_id: BTreeMap<String, String>,
}

pub type ShapeChoiceMapping = BTreeMap<ShapeId, Vec<ShapeChoice>>;
impl From<&ShapeProjection> for ShapeChoiceMapping {
  fn from(shape_projection: &ShapeProjection) -> Self {
    let choice_queries = ShapeChoiceQueries::from(shape_projection);
    let shape_choices = shape_projection
      .graph
      .node_indices()
      .filter_map(|i| {
        let node = shape_projection
          .graph
          .node_weight(i)
          .expect("node should exist");
        match node {
          Node::Shape(shape_node) => Some(shape_node),
          _ => None,
        }
      })
      .map(|shape_node| {
        let trail = ShapeTrail::new(shape_node.shape_id.clone());
        let choices = choice_queries.trail_choices(&trail).collect();
        (shape_node.shape_id.clone(), choices)
      });
    BTreeMap::from_iter(shape_choices)
  }
}

// duplicated in [projections/spectacle/endpoints.rs]
pub type SerializableGraph = GraphNodesAndEdges<Node, Edge>;
impl From<ShapeProjection> for SerializableGraph {
  fn from(shape_projection: ShapeProjection) -> Self {
    let (graph_nodes, graph_edges) = shape_projection.graph.into_nodes_edges();
    let nodes = graph_nodes.into_iter().map(|x| x.weight).collect();
    let edges = graph_edges
      .into_iter()
      .map(|x| (x.source().index(), x.target().index(), x.weight))
      .collect();
    let value: GraphNodesAndEdges<Node, Edge> = GraphNodesAndEdges {
      nodes,
      edges,
      node_index_to_id: BTreeMap::from_iter(
        shape_projection
          .node_id_to_index
          .into_iter()
          .map(|(k, v)| (v.index().to_string(), k)),
      ),
    };
    value
  }
}

impl ShapeProjection {
  pub fn to_json_string(&self) -> String {
    serde_json::to_string(&self.to_serializable_graph()).expect("graph should serialize")
  }

  pub fn to_serializable_graph(&self) -> SerializableGraph {
    let copy = self.clone();
    copy.into()
  }

  pub fn to_choice_mapping(&self) -> ShapeChoiceMapping {
    self.into()
  }
}
