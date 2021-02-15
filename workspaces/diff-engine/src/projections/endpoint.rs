use crate::commands::{EndpointCommand, SpecCommand, SpecCommandError};
use crate::events::endpoint as endpoint_events;
use crate::events::{EndpointEvent, SpecEvent};
use crate::state::endpoint::*;
use cqrs_core::{Aggregate, AggregateCommand, AggregateEvent, Event};
use petgraph::graph::{Graph, NodeIndex};
use std::collections::HashMap;

pub const ROOT_PATH_ID: &str = "root";

#[derive(Debug)]
pub struct PathComponentDescriptor {
  pub is_parameter: bool,
  pub name: String,
}

#[derive(Debug)]
pub struct BodyDescriptor {
  pub http_content_type: HttpContentType,
  pub root_shape_id: ShapeId,
}

#[derive(Debug)]
pub struct RequestBodyDescriptor {
  pub body: Option<BodyDescriptor>,
}

#[derive(Debug)]
pub struct ResponseBodyDescriptor {
  pub body: Option<BodyDescriptor>,
}

#[derive(Debug)]
pub enum Node {
  PathComponent(PathComponentId, PathComponentDescriptor),
  HttpMethod(HttpMethod),
  HttpStatusCode(HttpStatusCode),
  Request(RequestId, RequestBodyDescriptor),
  Response(ResponseId, ResponseBodyDescriptor),
}

#[derive(Debug)]
pub enum Edge {
  IsChildOf,
}

#[derive(Debug)]
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
    let request_node = Node::Request(request_id.clone(), RequestBodyDescriptor { body: None });
    let request_node_index = self.graph.add_node(request_node);
    self
      .graph
      .add_edge(request_node_index, method_node_index, Edge::IsChildOf);
    self.node_id_to_index.insert(request_id, request_node_index);
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

  pub fn get_path_component_node_index(
    &self,
    path_component_id: &PathComponentId,
  ) -> Option<&NodeIndex> {
    self.node_id_to_index.get(path_component_id)
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

impl AggregateEvent<EndpointProjection> for EndpointEvent {
  fn apply_to(self, aggregate: &mut EndpointProjection) {
    match self {
      EndpointEvent::PathComponentAdded(e) => {
        aggregate.with_path(e.parent_path_id, e.path_id, e.name);
      }
      EndpointEvent::PathParameterAdded(e) => {
        aggregate.with_path_parameter(e.parent_path_id, e.path_id, e.name)
      }
      EndpointEvent::RequestAdded(e) => {
        aggregate.with_request(e.path_id, e.http_method, e.request_id);
      }
      EndpointEvent::ResponseAddedByPathAndMethod(e) => {
        aggregate.with_response(e.path_id, e.http_method, e.http_status_code, e.response_id);
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

impl AggregateCommand<EndpointProjection> for EndpointCommand {
  type Error = SpecCommandError;
  type Event = EndpointEvent;
  type Events = Vec<EndpointEvent>;

  fn execute_on(self, projection: &EndpointProjection) -> Result<Self::Events, Self::Error> {
    let validation = CommandValidationQueries::from((projection, &self));

    let event = match self {
      EndpointCommand::AddPathComponent(command) => {
        validation.require(
          validation.path_component_id_exists(&command.parent_path_id),
          "parent path component must exist to add path component",
        )?;
        validation.require(
          !validation.path_component_id_exists(&command.path_id),
          "path id must be assignable to add path component",
        )?;

        EndpointEvent::from(endpoint_events::PathComponentAdded::from(command))
      }

      EndpointCommand::RemovePathComponent(command) => {
        validation.require(
          !validation.path_component_is_root(&command.path_id),
          "path id must not be root to remove path component",
        )?;

        EndpointEvent::from(endpoint_events::PathComponentRemoved::from(command))
      }

      _ => Err(SpecCommandError::Unimplemented(
        SpecCommand::EndpointCommand(self),
      ))?,
    };

    Ok(vec![event])
  }
}

struct CommandValidationQueries<'a> {
  command_description: String,
  endpoint_projection: &'a EndpointProjection,
}

impl<'a> CommandValidationQueries<'a> {
  fn require(&self, condition: bool, msg: &'static str) -> Result<(), SpecCommandError> {
    if condition {
      Ok(())
    } else {
      Err(SpecCommandError::Validation(format!(
        "Command failed validation: {}, {:?}",
        msg, self.command_description
      )))
    }
  }

  pub fn path_component_id_exists(&self, path_component_id: &PathComponentId) -> bool {
    self
      .endpoint_projection
      .get_path_component_node_index(path_component_id)
      .is_some()
  }

  pub fn path_component_is_root(&self, path_component_id: &PathComponentId) -> bool {
    path_component_id == ROOT_PATH_ID
  }
}

impl<'a> From<(&'a EndpointProjection, &EndpointCommand)> for CommandValidationQueries<'a> {
  fn from(
    (endpoint_projection, endpoint_command): (&'a EndpointProjection, &EndpointCommand),
  ) -> Self {
    Self {
      command_description: format!("{:?}", endpoint_command),
      endpoint_projection,
    }
  }
}
