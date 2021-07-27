use crate::events::{EndpointEvent, Event, ShapeEvent, SpecEvent};
use crate::projections::endpoint::ROOT_PATH_ID;
use crate::state::endpoint::{
  HttpContentType, HttpMethod, HttpStatusCode, PathComponentId, QueryParametersId,
  QueryParametersShapeDescriptor, RequestId, ResponseId,
};
use crate::state::shape::ShapeId;
use crate::RfcEvent;
use cqrs_core::{Aggregate, AggregateEvent};
use petgraph::csr::NodeIndex;
use petgraph::visit::EdgeRef;
use petgraph::Direction::Incoming;
use petgraph::Graph;
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, HashMap};
use std::error::Error;
use std::iter::FromIterator;

fn get_endpoint_id(path_id: &str, method: &str) -> String {
  format!("{}.{}", path_id, method.to_uppercase())
}

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
          projection.with_creation_history(c.client_command_batch_id, e.path_id);
        }
      }
      EndpointEvent::PathComponentRemoved(e) => {
        projection.without_path_component(&e.path_id);
        if let Some(c) = e.event_context {
          projection.with_remove_history(c.client_command_batch_id, e.path_id);
        }
      }
      EndpointEvent::PathParameterAdded(e) => {
        projection.with_path_parameter(e.parent_path_id, e.path_id.clone(), e.name);
        if let Some(c) = e.event_context {
          projection.with_creation_history(c.client_command_batch_id, e.path_id);
        }
      }
      EndpointEvent::PathParameterRemoved(e) => {
        projection.without_path_component(&e.path_id);
        if let Some(c) = e.event_context {
          projection.with_remove_history(c.client_command_batch_id, e.path_id);
        }
      }
      EndpointEvent::RequestAdded(e) => {
        projection.with_request(e.request_id.clone(), e.path_id, e.http_method);

        if let Some(c) = e.event_context {
          projection.with_creation_history(c.client_command_batch_id, e.request_id);
        }
      }
      EndpointEvent::RequestRemoved(e) => {
        projection.without_request(&e.request_id);
        if let Some(c) = e.event_context {
          projection.with_remove_history(c.client_command_batch_id, e.request_id);
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
          projection.with_creation_history(c.client_command_batch_id, e.response_id);
        }
      }
      EndpointEvent::ResponseRemoved(e) => {
        projection.without_response(&e.response_id);
        if let Some(c) = e.event_context {
          projection.with_remove_history(c.client_command_batch_id, e.response_id);
        }
      }
      EndpointEvent::RequestBodySet(e) => {
        projection.with_request_body(
          e.request_id,
          e.body_descriptor.http_content_type,
          e.body_descriptor.shape_id.clone(),
        );

        if let Some(c) = e.event_context {
          projection.with_creation_history(c.client_command_batch_id, e.body_descriptor.shape_id);
        }
      }
      EndpointEvent::QueryParametersAdded(e) => {
        projection.with_query_parameters(e.path_id, e.http_method, e.query_parameters_id);
      }
      EndpointEvent::QueryParametersShapeSet(e) => {
        projection.with_query_parameters_shape(e.query_parameters_id.clone(), e.shape_descriptor);
        // We treat the query parameter only as created when there is a shape attached to it
        if let Some(c) = e.event_context {
          projection.with_creation_history(c.client_command_batch_id, e.query_parameters_id);
        }
      }
      EndpointEvent::QueryParametersRemoved(e) => {
        projection.without_query_parameters(&e.query_parameters_id);
        if let Some(c) = e.event_context {
          projection.with_remove_history(c.client_command_batch_id, e.query_parameters_id);
        }
      }
      EndpointEvent::ResponseBodySet(e) => {
        projection.with_response_body(
          e.response_id,
          e.body_descriptor.http_content_type,
          e.body_descriptor.shape_id.clone(),
        );

        if let Some(c) = e.event_context {
          projection.with_creation_history(c.client_command_batch_id, e.body_descriptor.shape_id);
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

  pub fn without_path_component(&mut self, path_id: &PathComponentId) {
    let path_node_index = *self
      .domain_id_to_index
      .get(path_id)
      .expect("expected path_id to have a corresponding node");

    if let Some(Node::Path(path_node)) = self.graph.node_weight_mut(path_node_index) {
      path_node.is_removed = true;
    }
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
      is_removed: false,
    }));
    self.domain_id_to_index.insert(path_id, node_index);

    if let Some(parent_node_index) = parent_node_index_option {
      self
        .graph
        .add_edge(node_index, parent_node_index, Edge::IsChildOf);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  fn ensure_endpoint_node_index(
    &mut self,
    path_id: PathComponentId,
    http_method: HttpMethod,
  ) -> petgraph::graph::NodeIndex {
    let endpoint_id = get_endpoint_id(&path_id, &http_method);
    let maybe_endpoint_index = self.domain_id_to_index.get(&endpoint_id);

    if let Some(endpoint_index) = maybe_endpoint_index {
      // Unremove the endpoint - because we don't model endpoints in events, we don't have a unique id
      // when endpoints with the same path + method are recreated
      if let Some(Node::Endpoint(endpoint_node)) = self.graph.node_weight_mut(*endpoint_index) {
        endpoint_node.is_removed = false;
      }
      *endpoint_index
    } else {
      // If the endpoint doesn't exist, create it
      let path_index = self
        .domain_id_to_index
        .get(&path_id)
        .expect("expected node with domain_id $path_id to exist in the graph");

      let node = Node::Endpoint(EndpointNode {
        id: endpoint_id.clone(),
        path_id,
        http_method,
        is_removed: false,
      });

      let endpoint_index = self.graph.add_node(node);
      self
        .graph
        .add_edge(endpoint_index, *path_index, Edge::IsChildOf);
      self.domain_id_to_index.insert(endpoint_id, endpoint_index);

      endpoint_index
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Looks to the parent node and extracts the parent endpoint id
  fn get_endpoint_id_from_node(&self, id: &str) -> String {
    let node_index = *self
      .domain_id_to_index
      .get(id)
      .expect("expected node to exist in graph");

    let endpoint_node = self
      .graph
      .edges_directed(node_index, petgraph::Direction::Outgoing)
      .find_map(|parent_edge| {
        let node = self.graph.node_weight(parent_edge.target());

        if let Some(Node::Endpoint(endpoint_node)) = node {
          Some(endpoint_node)
        } else {
          None
        }
      })
      .expect("expect node to have a path node parent");

    get_endpoint_id(&endpoint_node.path_id, &endpoint_node.http_method)
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  fn remove_endpoint_node_if_unused(&mut self, endpoint_id: &str) {
    let endpoint_index = self
      .domain_id_to_index
      .get(endpoint_id)
      .expect("expected endpoint to exist in graph");

    let endpoint_node_is_unused = self
      .graph
      .edges_directed(*endpoint_index, petgraph::Direction::Incoming)
      .all(|child_edge| {
        let child_edge_index = child_edge.target();
        let node = self
          .graph
          .node_weight(child_edge_index)
          .expect("node to exist in graph");
        match node {
          Node::QueryParameters(QueryParametersNode {
            is_removed: true, ..
          }) => true,
          Node::Request(RequestNode {
            is_removed: true, ..
          }) => true,
          Node::Response(ResponseNode {
            is_removed: true, ..
          }) => true,
          _ => false,
        }
      });

    if let Some(Node::Endpoint(endpoint_node)) = self.graph.node_weight_mut(*endpoint_index) {
      endpoint_node.is_removed = true;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_request(
    &mut self,
    request_id: RequestId,
    path_id: PathComponentId,
    http_method: HttpMethod,
  ) {
    let endpoint_index = self.ensure_endpoint_node_index(path_id, http_method);
    let node = Node::Request(RequestNode {
      request_id: request_id.clone(),
      is_removed: false,
    });

    let node_index = self.graph.add_node(node);
    self
      .graph
      .add_edge(node_index, endpoint_index, Edge::IsChildOf);

    self.domain_id_to_index.insert(request_id, node_index);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn without_request(&mut self, request_id: &RequestId) {
    let request_node_index = *self
      .domain_id_to_index
      .get(request_id)
      .expect("expected request_id to have a corresponding node");

    if let Some(Node::Request(request_node)) = self.graph.node_weight_mut(request_node_index) {
      request_node.is_removed = true;
      let endpoint_id = self.get_endpoint_id_from_node(request_id);
      self.remove_endpoint_node_if_unused(&endpoint_id);
    }
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_response(
    &mut self,
    response_id: ResponseId,
    path_id: PathComponentId,
    http_method: HttpMethod,
    http_status_code: HttpStatusCode,
  ) {
    let endpoint_index = self.ensure_endpoint_node_index(path_id, http_method);

    let node = Node::Response(ResponseNode {
      http_status_code: http_status_code,
      response_id: response_id.clone(),
      is_removed: false,
    });

    let node_index = self.graph.add_node(node);
    self
      .graph
      .add_edge(node_index, endpoint_index, Edge::IsChildOf);

    self.domain_id_to_index.insert(response_id, node_index);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn without_response(&mut self, response_id: &ResponseId) {
    let response_node_index = *self
      .domain_id_to_index
      .get(response_id)
      .expect("expected response_id to have a corresponding node");

    if let Some(Node::Response(response_node)) = self.graph.node_weight_mut(response_node_index) {
      response_node.is_removed = true;
      let endpoint_id = self.get_endpoint_id_from_node(response_id);
      self.remove_endpoint_node_if_unused(&endpoint_id);
    }
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

    let endpoint_id = self.get_endpoint_id_from_node(&request_id);
    let endpoint_index = *self
      .domain_id_to_index
      .get(&endpoint_id)
      .expect("expected node to exist in graph");

    let node = Node::Body(BodyNode {
      http_content_type: http_content_type.clone(),
      root_shape_id: root_shape_id.clone(),
      is_removed: false,
    });

    // If there is already a set request body with a matching content type, we should remove it
    // @GOTCHA - this only allows a single content type request parameter to be attached to an endpoint node
    // This means history is only visible to users for the latest request node with content type
    // @GOTCHA - 2021/07/27 - event generation does not group together same path + method, meaning we need to search
    // all request ids attached to an endpoint node (i.e. request -> body is 1:1 since request nodes are never reused)
    let maybe_request = self
      .graph
      .edges_directed(endpoint_index, petgraph::Direction::Incoming)
      .find_map(|child_edge| {
        let node = self.graph.node_weight(child_edge.source());
        if let Some(Node::Request(request_node)) = node {
          let request_node_index = *self
            .domain_id_to_index
            .get(&request_node.request_id)
            .expect("expected node with domain_id $request_id to exist in the graph");

          // From this request node, see if there is a body that matches the
          // content type that is currently being inserted
          self
            .graph
            .edges_directed(request_node_index, petgraph::Direction::Incoming)
            .find_map(|request_child_edge| {
              let request_child_node = self.graph.node_weight(request_child_edge.source());
              // @GOTCHA we'll need to update this if request / response nodes are reused for
              // different content types - this currently will orphan any request node that contains
              // a body that matches the inserted content type - if we reuse request nodes, we'll need to
              // orphan the body node instead of the request node
              match request_child_node {
                Some(Node::Body(body_node))
                  if &body_node.http_content_type == &http_content_type =>
                {
                  Some((child_edge.id(), request_node.request_id.clone()))
                }
                _ => None,
              }
            })
        } else {
          None
        }
      });

    if let Some((request_edge, request_id)) = maybe_request {
      self.graph.remove_edge(request_edge);
      self.domain_id_to_index.remove(&request_id);
    }

    let node_index = self.graph.add_node(node);
    self
      .domain_id_to_index
      .insert(root_shape_id.clone(), node_index);
    self
      .graph
      .add_edge(node_index, request_index, Edge::IsChildOf);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_query_parameters(
    &mut self,
    path_id: PathComponentId,
    http_method: HttpMethod,
    query_parameters_id: QueryParametersId,
  ) {
    let endpoint_index = self.ensure_endpoint_node_index(path_id, http_method);

    // If there is already a set query parameter, we should remove it
    // @GOTCHA - this only allows a single query parameter to be attached to an endpoint node
    // This means history is only visible to users for the latest query parameter node
    let maybe_query_params = self
      .graph
      .edges_directed(endpoint_index, petgraph::Direction::Incoming)
      .find_map(|child_edge| {
        let node = self.graph.node_weight(child_edge.source());

        if let Some(Node::QueryParameters(query_param_node)) = node {
          Some((
            child_edge.id(),
            query_param_node.query_parameters_id.clone(),
          ))
        } else {
          None
        }
      });

    if let Some((query_param_edge, query_param_id)) = maybe_query_params {
      self.graph.remove_edge(query_param_edge);
      self.domain_id_to_index.remove(&query_param_id);
    }

    let node = Node::QueryParameters(QueryParametersNode {
      query_parameters_id: query_parameters_id.clone(),
      root_shape_id: None,
      is_removed: false,
    });
    let node_index = self.graph.add_node(node);
    self
      .graph
      .add_edge(node_index, endpoint_index, Edge::IsChildOf);

    self
      .domain_id_to_index
      .insert(query_parameters_id, node_index);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn with_query_parameters_shape(
    &mut self,
    query_parameters_id: QueryParametersId,
    shape_descriptor: QueryParametersShapeDescriptor,
  ) {
    let query_index = *self
      .domain_id_to_index
      .get(&query_parameters_id)
      .expect("expected node with domain_id $request_id to exist in the graph");

    if let Some(Node::QueryParameters(query_node)) = self.graph.node_weight_mut(query_index) {
      query_node.root_shape_id = Some(shape_descriptor.shape_id.clone());
      query_node.is_removed = shape_descriptor.is_removed;
    }
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  pub fn without_query_parameters(&mut self, query_parameters_id: &QueryParametersId) {
    let query_parameters_index = *self
      .domain_id_to_index
      .get(query_parameters_id)
      .expect("expected node with domain_id $path_id to exist in the graph");

    if let Some(Node::QueryParameters(query_node)) =
      self.graph.node_weight_mut(query_parameters_index)
    {
      query_node.is_removed = true;
      let endpoint_id = self.get_endpoint_id_from_node(query_parameters_id);
      self.remove_endpoint_node_if_unused(&endpoint_id);
    }
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

    let endpoint_id = self.get_endpoint_id_from_node(&response_id);
    let endpoint_index = *self
      .domain_id_to_index
      .get(&endpoint_id)
      .expect("expected node to exist in graph");

    let node = Node::Body(BodyNode {
      http_content_type: http_content_type.clone(),
      root_shape_id: root_shape_id.clone(),
      is_removed: false,
    });

    let response_status_code =
      if let Some(Node::Response(response_node)) = self.graph.node_weight(response_index) {
        Some(response_node.http_status_code)
      } else {
        None
      }
      .expect("expected response node with response_id in the graph");

    // If there is already a set response body with a matching status code and content type, we should remove it
    // @GOTCHA - this only allows a single status code and content type request parameter to be attached to an endpoint node
    // This means history is only visible to users for the latest response node with status code and content type
    // @GOTCHA - 2021/07/27 - event generation does not group together same path + method, meaning we need to search
    // all response ids attached to an endpoint node (i.e. response -> body is 1:1 since response nodes are never reused)
    let maybe_response = self
      .graph
      .edges_directed(endpoint_index, petgraph::Direction::Incoming)
      .find_map(|child_edge| {
        let node = self.graph.node_weight(child_edge.source());

        match node {
          Some(Node::Response(response_node))
            if response_node.http_status_code == response_status_code =>
          {
            let node_index = *self
              .domain_id_to_index
              .get(&response_node.response_id)
              .expect("expected node with domain_id $response_id to exist in the graph");

            // From this request node, see if there is a body that matches the
            // content type that is currently being inserted
            self
              .graph
              .edges_directed(node_index, petgraph::Direction::Incoming)
              .find_map(|response_child_edge| {
                let response_child_node = self.graph.node_weight(response_child_edge.source());
                // @GOTCHA we'll need to update this if request / response nodes are reused for
                // different content types - this currently will orphan any request node that contains
                // a body that matches the inserted content type - if we reuse response nodes, we'll need to
                // orphan the body node instead of the response node
                match response_child_node {
                  Some(Node::Body(body_node))
                    if &body_node.http_content_type == &http_content_type =>
                  {
                    Some((child_edge.id(), response_node.response_id.clone()))
                  }
                  _ => None,
                }
              })
          }
          _ => None,
        }
      });

    if let Some((response_edge, response_id)) = maybe_response {
      self.graph.remove_edge(response_edge);
      self.domain_id_to_index.remove(&response_id);
    }

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
  pub fn with_creation_history(&mut self, batch_id: String, created_node_id: String) {
    let created_node_index = self
      .domain_id_to_index
      .get(&created_node_id)
      .expect("expected created_node_id to exist");

    let batch_node_index_option = self.domain_id_to_index.get(&batch_id);

    if let Some(batch_node_index) = batch_node_index_option {
      self
        .graph
        .add_edge(*created_node_index, *batch_node_index, Edge::CreatedIn);
    } else {
      eprintln!("bad implicit batch id {}", &batch_id);
    }
  }
  pub fn with_update_history(&mut self, batch_id: String, updated_node_id: String) {
    let updated_node_index = self
      .domain_id_to_index
      .get(&updated_node_id)
      .expect("expected updated_node_id to exist");

    let batch_node_index_option = self.domain_id_to_index.get(&batch_id);

    if let Some(batch_node_index) = batch_node_index_option {
      self
        .graph
        .add_edge(*updated_node_index, *batch_node_index, Edge::UpdatedIn);
    } else {
      eprintln!("bad implicit batch id {}", &batch_id);
    }
  }
  pub fn with_remove_history(&mut self, batch_id: String, removed_node_id: String) {
    let removed_node_index = self
      .domain_id_to_index
      .get(&removed_node_id)
      .expect("expected removed_node_id to exist");

    let batch_node_index_option = self.domain_id_to_index.get(&batch_id);

    if let Some(batch_node_index) = batch_node_index_option {
      self
        .graph
        .add_edge(*removed_node_index, *batch_node_index, Edge::RemovedIn);
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
  Endpoint(EndpointNode),
  Request(RequestNode),
  Response(ResponseNode),
  QueryParameters(QueryParametersNode),
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
  is_removed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EndpointNode {
  path_id: PathComponentId,
  http_method: HttpMethod,
  id: String,
  is_removed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestNode {
  request_id: RequestId,
  is_removed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryParametersNode {
  query_parameters_id: String,
  root_shape_id: Option<ShapeId>,
  is_removed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseNode {
  http_status_code: HttpStatusCode,
  response_id: ResponseId,
  is_removed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BodyNode {
  http_content_type: HttpContentType,
  root_shape_id: ShapeId,
  is_removed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum Edge {
  IsChildOf,
  CreatedIn,
  UpdatedIn,
  RemovedIn,
}
////////////////////////////////////////////////////////////////////////////////////////////////////
