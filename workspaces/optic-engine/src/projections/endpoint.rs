use crate::events::endpoint as endpoint_events;
use crate::events::{EndpointEvent, SpecEvent};
use crate::state::endpoint::*;
use crate::{
  commands::{endpoint, EndpointCommand, SpecCommand, SpecCommandError},
  events::http_interaction::Response,
};
use cqrs_core::{Aggregate, AggregateCommand, AggregateEvent, Event};
use petgraph::graph::{Graph, NodeIndex};
use petgraph::visit::EdgeRef;
use serde::Serialize;
use std::collections::HashMap;

pub const ROOT_PATH_ID: &str = "root";

#[derive(Debug, Clone)]
pub struct PathComponentDescriptor {
  pub is_parameter: bool,
  pub name: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct BodyDescriptor {
  pub http_content_type: HttpContentType,
  pub root_shape_id: ShapeId,
}

#[derive(Debug, Serialize, Clone)]
pub struct QueryParametersDescriptor {
  pub shape: Option<QueryParametersShapeDescriptor>,
}

#[derive(Debug, Serialize, Clone)]
pub struct RequestDescriptor {
  pub body: Option<BodyDescriptor>,
}

#[derive(Debug, Serialize, Clone)]
pub struct ResponseBodyDescriptor {
  pub body: Option<BodyDescriptor>,
}

#[derive(Debug, Clone)]
pub enum Node {
  HttpMethod(HttpMethod),
  HttpStatusCode(HttpStatusCode),
  PathComponent(PathComponentId, PathComponentDescriptor),
  QueryParameters(QueryParametersId, QueryParametersDescriptor),
  Request(RequestId, RequestDescriptor),
  Response(ResponseId, ResponseBodyDescriptor),
}

#[derive(Debug, Clone)]
pub enum Edge {
  IsChildOf,
}

#[derive(Debug, Clone)]
pub struct EndpointProjection {
  pub graph: Graph<Node, Edge>,
  // SAFETY: node indices are not stable upon removing of nodes from graph -> node indices might be referred to
  // which no longer exist or point to a different node. Compiler can't track these nodes for us. Do not delete nodes
  // without rebuilding this map.
  pub node_id_to_index: HashMap<String, petgraph::graph::NodeIndex>,
}

impl EndpointProjection {
  pub fn from_events<E>(events: impl Iterator<Item = E>) -> Self
  where
    E: AggregateEvent<Self>,
  {
    let mut projection = EndpointProjection::default();
    for event in events {
      projection.apply(event);
    }
    projection
  }

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

  pub fn without_path(&mut self, path_id: PathComponentId) {
    self.without_path_component(path_id);
  }

  pub fn without_path_parameter(&mut self, path_id: PathComponentId) {
    self.without_path_component(path_id);
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

  fn without_path_component(&mut self, path_id: PathComponentId) {
    let path_component_node_index = *self
      .node_id_to_index
      .get(&path_id)
      .expect("expected path_id to have a corresponding node");

    let parent_path_edge_index = self
      .graph
      .edges_directed(path_component_node_index, petgraph::Direction::Outgoing)
      .find(|parent_edge| {
        let parent_node_index = parent_edge.target();
        let node = self.graph.node_weight(parent_node_index);
        matches!(node, Some(Node::PathComponent(_, _)))
      })
      .map(|parent_edge| parent_edge.id());

    if let Some(parent_path_edge_index) = parent_path_edge_index {
      self.graph.remove_edge(parent_path_edge_index); // prevents path to be resolved from path node
    }
    self.node_id_to_index.remove(&path_id); // prevents path node to be looked up by path id

    // GOTCHA: we're not deleting the path node itself, as that would invalidate self.node_id_to_index
    // as the graph indexes shift.
    // GOTCHA: this assumes nested entities like requests and responses have already been deleted,
    // as it does not delete ids for those nested entities
  }

  pub fn with_query_parameters(
    &mut self,
    path_id: PathComponentId,
    http_method: HttpMethod,
    query_parameters_id: QueryParametersId,
  ) {
    if let Some(_) = self.get_endpoint_query_parameter_node(&path_id, &http_method) {
      panic!("only a single query parameters node can correspond to an endpoint")
    }

    let path_node_index = *self
      .node_id_to_index
      .get(&path_id)
      .expect("expected path_id to have a corresponding node");
    let method_node_index = self.ensure_method_node(path_node_index, http_method);
    let query_params_node = Node::QueryParameters(
      query_parameters_id.clone(),
      QueryParametersDescriptor { shape: None },
    );

    let query_params_node_index = self.graph.add_node(query_params_node);
    self
      .graph
      .add_edge(query_params_node_index, method_node_index, Edge::IsChildOf);
    self
      .node_id_to_index
      .insert(query_parameters_id, query_params_node_index);
  }

  pub fn with_query_parameters_shape(
    &mut self,
    query_parameters_id: QueryParametersId,
    shape_descriptor: QueryParametersShapeDescriptor,
  ) {
    let query_params_node_index = self
      .node_id_to_index
      .get(&query_parameters_id)
      .expect("expected query_parameters_id to have a corresponding node");
    let request_node = self
      .graph
      .node_weight_mut(*query_params_node_index)
      .unwrap();
    let query_params_descriptor = match request_node {
      Node::QueryParameters(id, descriptor) => descriptor,
      _ => unreachable!("query parameter ids should point to query parameter nodes"),
    };

    query_params_descriptor.shape = Some(shape_descriptor);
  }

  pub fn with_request(
    &mut self,
    path_id: PathComponentId,
    http_method: HttpMethod,
    request_id: RequestId,
  ) {
    let path_node_index = *self
      .node_id_to_index
      .get(&path_id)
      .expect("expected path_id to have a corresponding node");
    let method_node_index = self.ensure_method_node(path_node_index, http_method);
    let request_node = Node::Request(request_id.clone(), RequestDescriptor { body: None });
    let request_node_index = self.graph.add_node(request_node);
    self
      .graph
      .add_edge(request_node_index, method_node_index, Edge::IsChildOf);
    self.node_id_to_index.insert(request_id, request_node_index);
  }

  pub fn without_request(&mut self, request_id: RequestId) {
    let request_node_index = *self
      .node_id_to_index
      .get(&request_id)
      .expect("expected request_id to have a corresponding node");

    let method_parent_edge_index = self
      .graph
      .edges_directed(request_node_index, petgraph::Direction::Outgoing)
      .find(|parent_edge| {
        let parent_node_index = parent_edge.target();
        let node = self.graph.node_weight(parent_node_index);
        matches!(node, Some(Node::HttpMethod(_)))
      })
      .map(|parent_edge| parent_edge.id());

    if let Some(method_parent_edge_index) = method_parent_edge_index {
      self.graph.remove_edge(method_parent_edge_index); // prevents request to be resolved from path node
    }
    self.node_id_to_index.remove(&request_id); // prevents request node to be looked up by request id

    // GOTCHA: we're not deleting the request node itself, as that would invalidate self.node_id_to_index
    // as the graph indexes shift.
    // TODO: figure out the implications of the above, like correctness of queries and
    // eventual garbage collection.
  }

  fn ensure_method_node(
    &mut self,
    path_node_index: petgraph::graph::NodeIndex,
    http_method: HttpMethod,
  ) -> petgraph::graph::NodeIndex {
    let mut children = self
      .graph
      .neighbors_directed(path_node_index, petgraph::Direction::Incoming);
    // ensure method node
    let method_node_index_option = children.find(|node_index| {
      let node = self.graph.node_weight(*node_index).unwrap();
      match node {
        Node::HttpMethod(method) => *method == http_method,
        _ => false,
      }
    });
    let method_node_index = if let None = method_node_index_option {
      let method_node = Node::HttpMethod(http_method);
      let method_node_index = self.graph.add_node(method_node);
      self
        .graph
        .add_edge(method_node_index, path_node_index, Edge::IsChildOf);
      method_node_index
    } else {
      method_node_index_option.unwrap()
    };
    method_node_index
  }

  fn ensure_status_code_node(
    &mut self,
    method_node_index: petgraph::graph::NodeIndex,
    http_status_code: HttpStatusCode,
  ) -> petgraph::graph::NodeIndex {
    let mut children = self
      .graph
      .neighbors_directed(method_node_index, petgraph::Direction::Incoming);
    // ensure status_code node
    let status_code_node_index_option = children.find(|node_index| {
      let node = self.graph.node_weight(*node_index).unwrap();
      match node {
        Node::HttpStatusCode(status_code) => *status_code == http_status_code,
        _ => false,
      }
    });
    let status_code_node_index = if let None = status_code_node_index_option {
      let status_code_node = Node::HttpStatusCode(http_status_code);
      let status_code_node_index = self.graph.add_node(status_code_node);
      self
        .graph
        .add_edge(status_code_node_index, method_node_index, Edge::IsChildOf);
      status_code_node_index
    } else {
      status_code_node_index_option.unwrap()
    };
    status_code_node_index
  }

  pub fn with_request_body(
    &mut self,
    request_id: RequestId,
    http_content_type: HttpContentType,
    shape_id: ShapeId,
  ) {
    let request_node_index = self
      .node_id_to_index
      .get(&request_id)
      .expect("expected request_id to have a corresponding node");
    let request_node = self.graph.node_weight_mut(*request_node_index).unwrap();
    match request_node {
      Node::Request(id, body_descriptor) => {
        body_descriptor.body = Some(BodyDescriptor {
          http_content_type,
          root_shape_id: shape_id,
        })
      }
      _ => {}
    }
  }

  pub fn with_response_body(
    &mut self,
    response_id: ResponseId,
    http_content_type: HttpContentType,
    shape_id: ShapeId,
  ) {
    let response_node_index = self
      .node_id_to_index
      .get(&response_id)
      .expect("expected response_id to have a corresponding node");
    let response_node = self.graph.node_weight_mut(*response_node_index).unwrap();
    match response_node {
      Node::Response(id, body_descriptor) => {
        body_descriptor.body = Some(BodyDescriptor {
          http_content_type,
          root_shape_id: shape_id,
        });
      }
      _ => {}
    }
  }

  pub fn with_response(
    &mut self,
    path_id: PathComponentId,
    http_method: HttpMethod,
    http_status_code: HttpStatusCode,
    response_id: ResponseId,
  ) {
    let path_node_index = *self
      .node_id_to_index
      .get(&path_id)
      .expect("expected path_id to have a corresponding node");
    let method_node_index = self.ensure_method_node(path_node_index, http_method);
    let status_code_node_index = self.ensure_status_code_node(method_node_index, http_status_code);

    let response_node = Node::Response(response_id.clone(), ResponseBodyDescriptor { body: None });
    let response_node_index = self.graph.add_node(response_node);
    self
      .graph
      .add_edge(response_node_index, status_code_node_index, Edge::IsChildOf);
    self
      .node_id_to_index
      .insert(response_id, response_node_index);
  }

  pub fn without_response(&mut self, response_id: ResponseId) {
    let response_node_index = *self
      .node_id_to_index
      .get(&response_id)
      .expect("expected response_id to have a corresponding node");

    let method_parent_edge_index = self
      .graph
      .edges_directed(response_node_index, petgraph::Direction::Outgoing)
      .find_map(|response_edge| {
        let status_code_node_index = response_edge.target();
        let _status_code_node = self
          .graph
          .node_weight(status_code_node_index)
          .filter(|node| matches!(node, Node::HttpStatusCode(_)))?;

        Some(status_code_node_index)
      })
      .map(|status_code_node_index| {
        self
          .graph
          .edges_directed(status_code_node_index, petgraph::Direction::Outgoing)
          .find_map(|status_code_edge| {
            let _method_node = self
              .graph
              .node_weight(status_code_edge.target())
              .filter(|node| matches!(node, Node::HttpMethod(_)))?;

            Some(status_code_edge.id())
          })
      })
      .flatten();

    if let Some(method_parent_edge_index) = method_parent_edge_index {
      self.graph.remove_edge(method_parent_edge_index); // prevents response to be resolved from path node
    }
    self.node_id_to_index.remove(&response_id); // prevents request node to be looked up by response id

    // GOTCHA: we're not deleting the request node itself, as that would invalidate self.node_id_to_index
    // as the graph indexes shift.
    // TODO: figure out the implications of the above, like correctness of queries and
    // eventual garbage collection.
  }

  pub fn get_path_component_node_index(
    &self,
    path_component_id: &PathComponentId,
  ) -> Option<&NodeIndex> {
    let node_index = self.node_id_to_index.get(path_component_id)?;
    let node = self.graph.node_weight(*node_index)?;
    if let &Node::PathComponent(_, _) = node {
      Some(node_index)
    } else {
      None
    }
  }

  pub fn get_path_component_descriptor(
    &self,
    path_id: &PathComponentId,
  ) -> Option<PathComponentDescriptor> {
    let path_node_index = self.node_id_to_index.get(path_id)?;
    let node = self.graph.node_weight(*path_node_index)?;
    if let &Node::PathComponent(_, ref descriptor) = node {
      Some(descriptor.clone())
    } else {
      None
    }
  }

  pub fn get_query_params_node_index(
    &self,
    query_params_id: &QueryParametersId,
  ) -> Option<&NodeIndex> {
    let node_index = self.node_id_to_index.get(query_params_id)?;
    let node = self.graph.node_weight(*node_index)?;
    if let &Node::QueryParameters(_, _) = node {
      Some(node_index)
    } else {
      None
    }
  }

  pub fn get_request_node_index(&self, request_id: &RequestId) -> Option<&NodeIndex> {
    let node_index = self.node_id_to_index.get(request_id)?;
    let node = self.graph.node_weight(*node_index)?;
    if let &Node::Request(_, _) = node {
      Some(node_index)
    } else {
      None
    }
  }

  pub fn get_response_node_index(&self, response_id: &ResponseId) -> Option<&NodeIndex> {
    let node_index = self.node_id_to_index.get(response_id)?;
    let node = self.graph.node_weight(*node_index)?;
    if let &Node::Response(_, _) = node {
      Some(node_index)
    } else {
      None
    }
  }

  pub fn get_child_path_component_nodes<'a>(
    &'a self,
    path_id: &'a PathComponentId,
  ) -> Option<impl Iterator<Item = &'a Node> + 'a> {
    let path_node_index = self.get_path_component_node_index(path_id)?;

    let children = self
      .graph
      .neighbors_directed(*path_node_index, petgraph::Direction::Incoming);

    let child_path_components = children.filter_map(move |node_index| {
      let node = self.graph.node_weight(node_index)?;
      match node {
        Node::PathComponent(_, _) => Some(node),
        _ => None,
      }
    });

    Some(child_path_components)
  }

  pub fn get_request_nodes<'a>(
    &'a self,
    path_id: &'a PathComponentId,
  ) -> Option<impl Iterator<Item = (&'a HttpMethod, &'a Node)> + 'a> {
    let path_node_index = self.get_path_component_node_index(path_id)?;

    let children = self
      .graph
      .neighbors_directed(*path_node_index, petgraph::Direction::Incoming);

    let request_nodes = children
      .filter_map(move |node_index| {
        let node = self.graph.node_weight(node_index)?;
        match node {
          Node::HttpMethod(http_method) => Some((node_index, http_method)),
          _ => None,
        }
      })
      .flat_map(move |(http_method_node_index, http_method)| {
        let response_nodes = self
          .graph
          .neighbors_directed(http_method_node_index, petgraph::Direction::Incoming);

        response_nodes
          .filter_map(move |i| {
            let node = self.graph.node_weight(i).unwrap();
            match node {
              Node::Response(response_id, body_descriptor) => Some(node),
              _ => None,
            }
          })
          .map(move |node| (http_method, node))
      });

    Some(request_nodes)
  }

  pub fn get_response_nodes<'a>(
    &'a self,
    path_id: &'a PathComponentId,
  ) -> Option<impl Iterator<Item = (&'a HttpMethod, &'a HttpStatusCode, &'a Node)> + 'a> {
    let path_node_index = self.get_path_component_node_index(path_id)?;

    let children = self
      .graph
      .neighbors_directed(*path_node_index, petgraph::Direction::Incoming);

    let response_nodes = children
      .filter_map(move |node_index| {
        let node = self.graph.node_weight(node_index)?;
        match node {
          Node::HttpMethod(http_method) => Some((node_index, http_method)),
          _ => None,
        }
      })
      .flat_map(move |(http_method_node_index, http_method)| {
        let status_code_nodes = self
          .graph
          .neighbors_directed(http_method_node_index, petgraph::Direction::Incoming);

        status_code_nodes.flat_map(move |status_code_node_index| {
          let status_code = self
            .graph
            .node_weight(status_code_node_index)
            .map(|node| match node {
              Node::HttpStatusCode(status_code) => Some(status_code),
              _ => None,
            })
            .flatten()
            .unwrap();
          let response_nodes = self
            .graph
            .neighbors_directed(status_code_node_index, petgraph::Direction::Incoming);

          response_nodes
            .filter_map(move |i| {
              let node = self.graph.node_weight(i).unwrap();
              match node {
                Node::Response(response_id, body_descriptor) => Some(node),
                _ => None,
              }
            })
            .map(move |node| (http_method, status_code, node))
        })
      });

    Some(response_nodes)
  }

  pub fn get_endpoint_response_nodes<'a>(
    &'a self,
    path_id: &'a PathComponentId,
    method: &'a HttpMethod,
  ) -> Option<impl Iterator<Item = &Node> + 'a> {
    let path_node_index = self.get_path_component_node_index(path_id)?;

    let children = self
      .graph
      .neighbors_directed(*path_node_index, petgraph::Direction::Incoming);

    let matching_method = children
      .filter(move |i| {
        let node = self.graph.node_weight(*i).unwrap();
        match node {
          Node::HttpMethod(http_method) => method == http_method,
          _ => false,
        }
      })
      .flat_map(move |i| {
        let status_code_nodes = self
          .graph
          .neighbors_directed(i, petgraph::Direction::Incoming);

        status_code_nodes
      })
      .flat_map(move |i| {
        let response_nodes = self
          .graph
          .neighbors_directed(i, petgraph::Direction::Incoming);
        let operations = response_nodes.filter_map(move |i| {
          let node = self.graph.node_weight(i).unwrap();
          match node {
            Node::Response(response_id, body_descriptor) => Some(node),
            _ => None,
          }
        });
        operations
      });

    Some(matching_method)
  }

  pub fn get_endpoint_query_parameter_node(
    &self,
    path_id: &PathComponentId,
    method: &HttpMethod,
  ) -> Option<(&QueryParametersId, &QueryParametersDescriptor)> {
    let path_node_index = self.get_path_component_node_index(path_id)?;

    let method_node_index = self
      .graph
      .neighbors_directed(*path_node_index, petgraph::Direction::Incoming)
      .find(move |i| {
        let node = self.graph.node_weight(*i).unwrap();
        match node {
          Node::HttpMethod(http_method) => method == http_method,
          _ => false,
        }
      })?;

    self
      .graph
      .neighbors_directed(method_node_index, petgraph::Direction::Incoming)
      .find_map(move |i| {
        let node = self.graph.node_weight(i).unwrap();
        match node {
          Node::QueryParameters(query_params_id, descriptor) => Some((query_params_id, descriptor)),
          _ => None,
        }
      })
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

impl<I> From<I> for EndpointProjection
where
  I: IntoIterator,
  I::Item: AggregateEvent<Self>,
{
  fn from(events: I) -> Self {
    let mut projection = EndpointProjection::default();
    for event in events.into_iter() {
      projection.apply(event);
    }
    projection
  }
}

// Events
// ------

impl AggregateEvent<EndpointProjection> for EndpointEvent {
  fn apply_to(self, aggregate: &mut EndpointProjection) {
    match self {
      EndpointEvent::PathComponentAdded(e) => {
        aggregate.with_path(e.parent_path_id, e.path_id, e.name);
      }
      EndpointEvent::PathComponentRemoved(e) => {
        aggregate.without_path(e.path_id);
      }
      EndpointEvent::PathParameterAdded(e) => {
        aggregate.with_path_parameter(e.parent_path_id, e.path_id, e.name);
      }
      EndpointEvent::PathParameterRemoved(e) => {
        aggregate.without_path_parameter(e.path_id);
      }
      EndpointEvent::QueryParametersAdded(e) => {
        aggregate.with_query_parameters(e.path_id, e.http_method, e.query_parameters_id);
      }
      EndpointEvent::QueryParametersShapeSet(e) => {
        aggregate.with_query_parameters_shape(e.query_parameters_id, e.shape_descriptor);
      }
      EndpointEvent::RequestAdded(e) => {
        aggregate.with_request(e.path_id, e.http_method, e.request_id);
      }
      EndpointEvent::RequestRemoved(e) => {
        aggregate.without_request(e.request_id);
      }
      EndpointEvent::ResponseAddedByPathAndMethod(e) => {
        aggregate.with_response(e.path_id, e.http_method, e.http_status_code, e.response_id);
      }
      EndpointEvent::ResponseRemoved(e) => {
        aggregate.without_response(e.response_id);
      }
      EndpointEvent::RequestBodySet(e) => {
        aggregate.with_request_body(
          e.request_id,
          e.body_descriptor.http_content_type,
          e.body_descriptor.shape_id,
        );
      }
      EndpointEvent::ResponseBodySet(e) => {
        aggregate.with_response_body(
          e.response_id,
          e.body_descriptor.http_content_type,
          e.body_descriptor.shape_id,
        );
      }
      _ => eprintln!(
        "Ignoring applying event of type '{}' for EndpointProjection",
        self.event_type()
      ),
    }
  }
}

impl AggregateEvent<EndpointProjection> for SpecEvent {
  fn apply_to(self, aggregate: &mut EndpointProjection) {
    if let SpecEvent::EndpointEvent(event) = self {
      event.apply_to(aggregate);
    }
  }
}
