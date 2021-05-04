use crate::events::{EndpointEvent, Event, ShapeEvent, SpecEvent};
use crate::projections::endpoint::ROOT_PATH_ID;
use crate::state::endpoint::{
  HttpContentType, HttpMethod, HttpStatusCode, PathComponentId, RequestId, ResponseId,
};
use crate::state::shape::ShapeId;
use crate::RfcEvent;
use cqrs_core::{Aggregate, AggregateEvent};
use petgraph::csr::NodeIndex;
use petgraph::Direction::Incoming;
use petgraph::Graph;
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashMap};
use std::error::Error;
use std::iter::FromIterator;

#[derive(Debug, Clone)]
pub struct EndpointsProjection {
  pub graph: Graph<Node, Edge>,

  // SAFETY: node indices are not stable upon removing of nodes from graph -> node indices might be referred to
  // which no longer exist or point to a different node. Compiler can't track these nodes for us. Do not delete nodes
  // without rebuilding these maps.
  pub domain_id_to_index: HashMap<String, petgraph::graph::NodeIndex>,
}

impl EndpointsProjection {
  pub fn to_json_string(&self) -> String {
    serde_json::to_string(&self.to_serializable_graph()).expect("graph should serialize")
  }

  pub fn to_serializable_graph(&self) -> SerializableGraph {
    let copy = self.clone();
    copy.into()
  }
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GraphNodesAndEdges<N, E> {
  nodes: Vec<N>,
  edges: Vec<(usize, usize, E)>,
  node_index_to_id: BTreeMap<String, String>,
}

// duplicated in [projections/shape.rs]
pub type SerializableGraph = GraphNodesAndEdges<Node, Edge>;
impl From<EndpointsProjection> for SerializableGraph {
  fn from(endpoint_projection: EndpointsProjection) -> Self {
    let (graph_nodes, graph_edges) = endpoint_projection.graph.into_nodes_edges();
    let nodes = graph_nodes.into_iter().map(|x| x.weight).collect();
    let edges = graph_edges
      .into_iter()
      .map(|x| (x.source().index(), x.target().index(), x.weight))
      .collect();
    let value: GraphNodesAndEdges<Node, Edge> = GraphNodesAndEdges {
      nodes,
      edges,
      node_index_to_id: BTreeMap::from_iter(
        endpoint_projection
          .domain_id_to_index
          .into_iter()
          .map(|(k, v)| (v.index().to_string(), k)),
      ),
    };
    value
  }
}

impl Default for EndpointsProjection {
  fn default() -> Self {
    let graph: Graph<Node, Edge> = Graph::new();
    let domain_id_to_index = HashMap::new();

    let mut projection = EndpointsProjection {
      graph,
      domain_id_to_index,
    };

    projection.with_path_component_node(
      String::from(ROOT_PATH_ID),
      None,
      String::from("/"),
      String::from(""),
      false,
    );
    projection
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

impl Aggregate for EndpointsProjection {
  fn aggregate_type() -> &'static str {
    "endpoints_projection"
  }
}

impl AggregateEvent<EndpointsProjection> for ShapeEvent {
  fn apply_to(self, projection: &mut EndpointsProjection) {}
}

impl AggregateEvent<EndpointsProjection> for EndpointEvent {
  fn apply_to(self, projection: &mut EndpointsProjection) {
    match self {
      EndpointEvent::PathComponentAdded(e) => {
        projection.with_path_component(e.parent_path_id, e.path_id.clone(), e.name);
        if let Some(c) = e.event_context {
          projection.with_creation_history(&c.client_command_batch_id, &e.path_id);
        }
      }
      EndpointEvent::PathParameterAdded(e) => {
        projection.with_path_parameter(e.parent_path_id, e.path_id.clone(), e.name);
        if let Some(c) = e.event_context {
          projection.with_creation_history(&c.client_command_batch_id, &e.path_id);
        }
      }
      EndpointEvent::RequestAdded(e) => {
        projection.with_request(e.request_id.clone(), e.path_id, e.http_method);

        if let Some(c) = e.event_context {
          projection.with_creation_history(&c.client_command_batch_id, &e.request_id);
        }
      }
      EndpointEvent::ResponseAddedByPathAndMethod(e) => {
        projection.with_response(
          e.response_id.clone(),
          e.path_id,
          e.http_method,
          e.http_status_code,
        );

        if let Some(c) = e.event_context {
          projection.with_creation_history(&c.client_command_batch_id, &e.response_id);
        }
      }
      EndpointEvent::RequestBodySet(e) => {
        //@GOTCHA: this doesn't invalidate previous RequestBodySet events for the same (request_id, http_content_type)
        projection.with_request_body(
          e.request_id,
          e.body_descriptor.http_content_type,
          e.body_descriptor.shape_id.clone(),
        );

        if let Some(c) = e.event_context {
          projection.with_creation_history(&c.client_command_batch_id, &e.body_descriptor.shape_id);
        }
      }
      EndpointEvent::ResponseBodySet(e) => {
        //@GOTCHA: this doesn't invalidate previous RequestBodySet events for the same (response_id, http_content_type)
        projection.with_response_body(
          e.response_id,
          e.body_descriptor.http_content_type,
          e.body_descriptor.shape_id.clone(),
        );

        if let Some(c) = e.event_context {
          projection.with_creation_history(&c.client_command_batch_id, &e.body_descriptor.shape_id);
        }
      }
      _ => eprintln!(
        "Ignoring applying event of type '{}' for '{}'",
        self.event_type(),
        EndpointsProjection::aggregate_type()
      ),
    }
  }
}

impl AggregateEvent<EndpointsProjection> for RfcEvent {
  fn apply_to(self, projection: &mut EndpointsProjection) {
    match self {
      RfcEvent::BatchCommitStarted(e) => projection.with_batch_commit(
        e.batch_id,
        e.event_context
          .expect("why is event_context optional again?")
          .created_at,
        e.commit_message,
      ),
      _ => eprintln!(
        "Ignoring applying event of type '{}' for '{}'",
        self.event_type(),
        EndpointsProjection::aggregate_type()
      ),
    }
  }
}

impl<I> From<I> for EndpointsProjection
where
  I: IntoIterator,
  I::Item: AggregateEvent<Self>,
{
  fn from(events: I) -> Self {
    let mut projection = EndpointsProjection::default();
    for event in events.into_iter() {
      projection.apply(event);
    }
    projection
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
impl EndpointsProjection {
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_path_component(
    &mut self,
    parent_path_id: PathComponentId,
    path_id: PathComponentId,
    path_name: String,
  ) {
    // build absolute path pattern inductively
    let parent_node_index = *self
      .domain_id_to_index
      .get(&parent_path_id)
      .expect("expected parent_path_id to exist in graph");
    let absolute_path_string: AbsolutePathPattern = if parent_path_id == ROOT_PATH_ID {
      format!("/{}", path_name)
    } else {
      let parent_node = self
        .graph
        .node_weight(parent_node_index)
        .expect("expected parent_path_id to exist in graph");
      match parent_node {
        Node::Path(n) => format!("{}/{}", n.absolute_path_pattern, path_name),
        _ => panic!("expected parent_node to be a Path"),
      }
    };

    self.with_path_component_node(
      path_id.clone(),
      Some(parent_node_index),
      absolute_path_string,
      path_name.clone(),
      false,
    );
  }

  pub fn with_path_parameter(
    &mut self,
    parent_path_id: PathComponentId,
    path_id: PathComponentId,
    path_name: String,
  ) {
    // build absolute path pattern inductively
    let parent_node_index = *self
      .domain_id_to_index
      .get(&parent_path_id)
      .expect("expected parent_path_id to exist in graph");
    let absolute_path_string: AbsolutePathPattern = if parent_path_id == ROOT_PATH_ID {
      format!("/{{}}")
    } else {
      let parent_node = self
        .graph
        .node_weight(parent_node_index)
        .expect("expected parent_path_id to exist in graph");
      match parent_node {
        Node::Path(n) => format!("{}/{{}}", n.absolute_path_pattern),
        _ => panic!("expected parent_node to be a Path"),
      }
    };
    self.with_path_component_node(
      path_id.clone(),
      Some(parent_node_index),
      absolute_path_string,
      path_name.clone(),
      true,
    );
  }

  pub fn with_path_component_node(
    &mut self,
    path_id: PathComponentId,
    parent_node_index_option: Option<petgraph::prelude::NodeIndex<u32>>,
    absolute_path_string: AbsolutePathPattern,
    path_name: String,
    is_parameterized: bool,
  ) {
    let node_index = self.graph.add_node(Node::Path(PathNode {
      absolute_path_pattern: absolute_path_string,
      path_id: path_id.clone(),
      name: path_name,
      is_parameterized,
    }));
    self.domain_id_to_index.insert(path_id, node_index);

    if let Some(parent_node_index) = parent_node_index_option {
      self
        .graph
        .add_edge(node_index, parent_node_index, Edge::IsChildOf);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_request(
    &mut self,
    request_id: RequestId,
    path_id: PathComponentId,
    http_method: HttpMethod,
  ) {
    let path_index = self
      .domain_id_to_index
      .get(&path_id)
      .expect("expected node with domain_id $path_id to exist in the graph");

    let node = Node::Request(RequestNode {
      http_method: http_method,
      request_id: request_id.clone(),
    });

    let node_index = self.graph.add_node(node);
    self
      .graph
      .add_edge(node_index, *path_index, Edge::IsChildOf);

    self.domain_id_to_index.insert(request_id, node_index);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_response(
    &mut self,
    response_id: ResponseId,
    path_id: PathComponentId,
    http_method: HttpMethod,
    http_status_code: HttpStatusCode,
  ) {
    let path_index = self
      .domain_id_to_index
      .get(&path_id)
      .expect("expected node with domain_id $path_id to exist in the graph");

    let node = Node::Response(ResponseNode {
      http_method: http_method,
      http_status_code: http_status_code,
      response_id: response_id.clone(),
    });

    let node_index = self.graph.add_node(node);
    self
      .graph
      .add_edge(node_index, *path_index, Edge::IsChildOf);

    self.domain_id_to_index.insert(response_id, node_index);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_request_body(
    &mut self,
    request_id: RequestId,
    http_content_type: HttpContentType,
    root_shape_id: ShapeId,
  ) {
    let request_index = *self
      .domain_id_to_index
      .get(&request_id)
      .expect("expected node with domain_id $request_id to exist in the graph");
    let node = Node::Body(BodyNode {
      http_content_type: http_content_type,
      root_shape_id: root_shape_id.clone(),
    });
    let node_index = self.graph.add_node(node);
    self
      .domain_id_to_index
      .insert(root_shape_id.clone(), node_index);
    self
      .graph
      .add_edge(node_index, request_index, Edge::IsChildOf);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_response_body(
    &mut self,
    response_id: ResponseId,
    http_content_type: HttpContentType,
    root_shape_id: ShapeId,
  ) {
    let response_index = *self
      .domain_id_to_index
      .get(&response_id)
      .expect("expected node with domain_id $response_id to exist in the graph");
    let node = Node::Body(BodyNode {
      http_content_type: http_content_type,
      root_shape_id: root_shape_id.clone(),
    });
    let node_index = self.graph.add_node(node);
    self
      .domain_id_to_index
      .insert(root_shape_id.clone(), node_index);
    self
      .graph
      .add_edge(node_index, response_index, Edge::IsChildOf);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_batch_commit(
    &mut self,
    batch_id: String,
    created_at: String,
    commit_message: String,
  ) {
    let node = Node::BatchCommit(BatchCommitNode {
      batch_id: batch_id.clone(),
      created_at: created_at.clone(),
      commit_message: commit_message.clone(),
    });
    let node_index = self.graph.add_node(node);
    self.domain_id_to_index.insert(batch_id, node_index);
  }
  pub fn with_creation_history(&mut self, batch_id: &str, created_node_id: &str) {
    let created_node_index = self
      .domain_id_to_index
      .get(created_node_id)
      .expect("expected created_node_id to exist");

    let batch_node_index_option = self.domain_id_to_index.get(batch_id);

    if let Some(batch_node_index) = batch_node_index_option {
      self
        .graph
        .add_edge(*created_node_index, *batch_node_index, Edge::CreatedIn);
    } else {
      eprintln!("bad implicit batch id {}", &batch_id);
    }
  }
  pub fn with_update_history(&mut self, batch_id: &str, updated_node_id: &str) {
    let updated_node_index = self
      .domain_id_to_index
      .get(updated_node_id)
      .expect("expected updated_node_id to exist");

    let batch_node_index_option = self.domain_id_to_index.get(batch_id);

    if let Some(batch_node_index) = batch_node_index_option {
      self
        .graph
        .add_edge(*updated_node_index, *batch_node_index, Edge::UpdatedIn);
    } else {
      eprintln!("bad implicit batch id {}", &batch_id);
    }
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
}
////////////////////////////////////////////////////////////////////////////////////////////////////

pub type AbsolutePathPattern = String;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum Node {
  Path(PathNode),
  Request(RequestNode),
  Response(ResponseNode),
  Body(BodyNode),
  BatchCommit(BatchCommitNode),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchCommitNode {
  batch_id: String,
  created_at: String,
  commit_message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathNode {
  absolute_path_pattern: AbsolutePathPattern,
  is_parameterized: bool,
  name: String,
  path_id: PathComponentId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestNode {
  http_method: HttpMethod,
  request_id: RequestId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseNode {
  http_method: HttpMethod,
  http_status_code: HttpStatusCode,
  response_id: ResponseId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BodyNode {
  http_content_type: HttpContentType,
  root_shape_id: ShapeId,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum Edge {
  IsChildOf,
  CreatedIn,
  UpdatedIn,
}
////////////////////////////////////////////////////////////////////////////////////////////////////
