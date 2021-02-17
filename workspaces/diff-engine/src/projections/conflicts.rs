use crate::events::{EndpointEvent, Event, ShapeEvent, SpecEvent};
use crate::projections::endpoint::ROOT_PATH_ID;
use crate::state::endpoint::{
  HttpContentType, HttpMethod, HttpStatusCode, PathComponentId, RequestId, ResponseId,
};
use cqrs_core::{Aggregate, AggregateEvent};
use petgraph::csr::NodeIndex;
use petgraph::Direction::Incoming;
use petgraph::Graph;
use std::collections::HashMap;

#[derive(Debug)]
pub struct ConflictsProjection {
  pub graph: Graph<Node, Edge>,

  // SAFETY: node indices are not stable upon removing of nodes from graph -> node indices might be referred to
  // which no longer exist or point to a different node. Compiler can't track these nodes for us. Do not delete nodes
  // without rebuilding these maps.
  pub node_id_to_index: HashMap<String, petgraph::graph::NodeIndex>,
  pub domain_id_to_index: HashMap<String, petgraph::graph::NodeIndex>,
}

impl Default for ConflictsProjection {
  fn default() -> Self {
    let graph: Graph<Node, Edge> = Graph::new();
    let node_id_to_index = HashMap::new();
    let domain_id_to_index = HashMap::new();

    let mut projection = ConflictsProjection {
      graph,
      node_id_to_index,
      domain_id_to_index,
    };

    projection.with_path_component_node(
      String::from(ROOT_PATH_ID),
      String::from("/"),
      vec![String::from(ROOT_PATH_ID)],
    );
    projection
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

impl Aggregate for ConflictsProjection {
  fn aggregate_type() -> &'static str {
    "conflicts_projection"
  }
}

impl AggregateEvent<ConflictsProjection> for ShapeEvent {
  fn apply_to(self, projection: &mut ConflictsProjection) {}
}

impl AggregateEvent<ConflictsProjection> for EndpointEvent {
  fn apply_to(self, projection: &mut ConflictsProjection) {
    match self {
      EndpointEvent::PathComponentAdded(e) => {
        projection.with_path_component(e.parent_path_id, e.path_id, e.name);
      }
      EndpointEvent::PathParameterAdded(e) => {
        projection.with_path_parameter(e.parent_path_id, e.path_id, e.name);
      }
      EndpointEvent::RequestAdded(e) => {
        projection.with_request(e.request_id, e.path_id, e.http_method);
      }
      EndpointEvent::ResponseAddedByPathAndMethod(e) => {
        projection.with_response(e.response_id, e.path_id, e.http_method, e.http_status_code);
      }
      EndpointEvent::RequestBodySet(e) => {
        //@TODO: projection.with_request_body_content_type(...)
      }
      EndpointEvent::ResponseBodySet(e) => {
        //@TODO: projection.with_response_body_content_type(...)
      }
      _ => eprintln!(
        "Ignoring applying event of type '{}' for ConflictsProjection",
        self.event_type()
      ),
    }
  }
}

impl AggregateEvent<ConflictsProjection> for SpecEvent {
  fn apply_to(self, projection: &mut ConflictsProjection) {}
}

impl<I> From<I> for ConflictsProjection
where
  I: IntoIterator,
  I::Item: AggregateEvent<Self>,
{
  fn from(events: I) -> Self {
    let mut projection = ConflictsProjection::default();
    for event in events.into_iter() {
      projection.apply(event);
    }
    projection
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
impl ConflictsProjection {
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_path_component(
    &mut self,
    parent_path_id: PathComponentId,
    path_id: PathComponentId,
    path_name: String,
  ) {
    // build absolute path pattern inductively
    let parent_node_index = self
      .domain_id_to_index
      .get(&parent_path_id)
      .expect("expected parent_path_id to exist in graph");
    let absolute_path_string: AbsolutePathPattern = if parent_path_id == ROOT_PATH_ID {
      format!("/{}", path_name)
    } else {
      let parent_node = self
        .graph
        .node_weight(*parent_node_index)
        .expect("expected parent_path_id to exist in graph");
      match parent_node {
        Node::Path(parent_absolute_path, _) => format!("{}/{}", parent_absolute_path, path_name),
        _ => panic!("expected parent_node to be a Path"),
      }
    };
    // find or create node with id = absolute path pattern
    if let Some(node_index) = self.node_id_to_index.get(&absolute_path_string) {
      let node = self
        .graph
        .node_weight_mut(*node_index)
        .expect("expected node to exist at node_index");
      match node {
        Node::Path(_, ids) => {
          ids.push(path_id.clone());
          self.domain_id_to_index.insert(path_id, *node_index);
        }
        _ => panic!("expected node to be a path component"),
      }
    } else {
      self.with_path_component_node(path_id.clone(), absolute_path_string, vec![path_id]);
    }
  }

  pub fn with_path_parameter(
    &mut self,
    parent_path_id: PathComponentId,
    path_id: PathComponentId,
    path_name: String,
  ) {
    // build absolute path pattern inductively
    let parent_node_index = self
      .domain_id_to_index
      .get(&parent_path_id)
      .expect("expected parent_path_id to exist in graph");
    let absolute_path_string: AbsolutePathPattern = if parent_path_id == ROOT_PATH_ID {
      format!("/{{}}")
    } else {
      let parent_node = self
        .graph
        .node_weight(*parent_node_index)
        .expect("expected parent_path_id to exist in graph");
      match parent_node {
        Node::Path(parent_absolute_path, _) => format!("{}/{{}}", parent_absolute_path),
        _ => panic!("expected parent_node to be a Path"),
      }
    };
    // find or create node with id = absolute path pattern
    if let Some(node_index) = self.node_id_to_index.get(&absolute_path_string) {
      let node = self
        .graph
        .node_weight_mut(*node_index)
        .expect("expected node to exist at node_index");
      match node {
        Node::Path(_, ids) => {
          ids.push(path_id.clone());
          self.domain_id_to_index.insert(path_id, *node_index);
        }
        _ => panic!("expected node to be a path component"),
      }
    } else {
      self.with_path_component_node(path_id.clone(), absolute_path_string, vec![path_id]);
    }
  }

  pub fn with_path_component_node(
    &mut self,
    path_id: PathComponentId,
    absolute_path_string: AbsolutePathPattern,
    ids: Vec<PathComponentId>,
  ) {
    let node_index = self
      .graph
      .add_node(Node::Path(absolute_path_string.clone(), ids));
    self
      .node_id_to_index
      .insert(absolute_path_string, node_index);
    self.domain_id_to_index.insert(path_id, node_index);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_http_method_node(
    &mut self,
    path_id: &PathComponentId,
    http_method: &HttpMethod,
  ) -> petgraph::graph::NodeIndex<u32> {
    let path_node_index = self
      .domain_id_to_index
      .get(path_id)
      .expect("expected path_id to exist in the graph");

    let existing_method_index = self
      .graph
      .neighbors_directed(*path_node_index, petgraph::Incoming)
      .find_map(|neighbor_node_index| {
        let neighbor = self
          .graph
          .node_weight(neighbor_node_index)
          .expect("expected node to exist at index");
        match neighbor {
          Node::HttpMethod(method, _) => {
            if *method == *http_method {
              Some(neighbor_node_index)
            } else {
              None
            }
          }
          _ => None,
        }
      });

    let method_index = match existing_method_index {
      Some(x) => x,
      None => {
        let method_node = Node::HttpMethod(http_method.clone(), vec![]);
        let method_node_index = self.graph.add_node(method_node);
        self
          .graph
          .add_edge(method_node_index, *path_node_index, Edge::IsChildOf);
        method_node_index
      }
    };

    method_index
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  pub fn with_request(
    &mut self,
    request_id: RequestId,
    path_id: PathComponentId,
    http_method: HttpMethod,
  ) {
    let method_index = self.with_http_method_node(&path_id, &http_method);
    let node = self
      .graph
      .node_weight_mut(method_index)
      .expect("expected method node to exist");
    match node {
      Node::HttpMethod(_, ids) => {
        ids.push(request_id.clone());
      }
      _ => {}
    }
    self.domain_id_to_index.insert(request_id, method_index);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_response(
    &mut self,
    response_id: ResponseId,
    path_id: PathComponentId,
    http_method: HttpMethod,
    http_status_code: HttpStatusCode,
  ) {
    let method_index = self.with_http_method_node(&path_id, &http_method);

    let existing_status_code_index = self
      .graph
      .neighbors_directed(method_index, petgraph::Incoming)
      .find_map(|neighbor_node_index| {
        let neighbor = self
          .graph
          .node_weight(neighbor_node_index)
          .expect("expected node to exist at index");
        match neighbor {
          Node::HttpStatusCode(status_code, ids) => {
            if *status_code == http_status_code {
              Some(neighbor_node_index)
            } else {
              None
            }
          }
          _ => None,
        }
      });

    let status_code_index = match existing_status_code_index {
      Some(x) => {
        let node = self
          .graph
          .node_weight_mut(x)
          .expect("expected node to exist");
        match node {
          Node::HttpStatusCode(_, ids) => ids.push(response_id.clone()),
          _ => {}
        }
        x
      }
      None => {
        let status_code_node = Node::HttpStatusCode(http_status_code, vec![response_id.clone()]);
        let status_code_node_index = self.graph.add_node(status_code_node);
        self
          .graph
          .add_edge(status_code_node_index, method_index, Edge::IsChildOf);
        status_code_node_index
      }
    };

    self
      .domain_id_to_index
      .insert(response_id, status_code_index);
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////

pub type AbsolutePathPattern = String;
pub type ConflictingIds = Vec<String>;

#[derive(Debug)]
pub enum Node {
  Path(AbsolutePathPattern, ConflictingIds),
  HttpMethod(HttpMethod, ConflictingIds),
  HttpStatusCode(HttpStatusCode, ConflictingIds),
  HttpContentType(HttpContentType, ConflictingIds),
}

#[derive(Debug)]
pub enum Edge {
  IsChildOf,
}
////////////////////////////////////////////////////////////////////////////////////////////////////
