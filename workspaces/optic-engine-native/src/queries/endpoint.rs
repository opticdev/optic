use crate::projections::endpoint::{Edge, EndpointProjection, Node, ROOT_PATH_ID};
use crate::projections::endpoint::{RequestBodyDescriptor, ResponseBodyDescriptor};
use crate::state::endpoint::{
  HttpMethod, HttpStatusCode, PathComponentId, PathComponentIdRef, RequestId, ResponseId,
};
use crate::HttpInteraction;
use petgraph::graph::Graph;
use petgraph::visit::EdgeFilteredNeighborsDirected;

pub struct EndpointQueries<'a> {
  pub endpoint_projection: &'a EndpointProjection,
}

impl<'a> EndpointQueries<'a> {
  pub fn new(endpoint_projection: &'a EndpointProjection) -> Self {
    EndpointQueries {
      endpoint_projection,
    }
  }

  fn extract_normalized_path(path: &str) -> &str {
    if path.eq("/") {
      path
    } else if path.ends_with("/") {
      &path[..path.len() - 1]
    } else {
      path
    }
  }

  pub fn resolve_interaction_path(
    &self,
    interaction: &HttpInteraction,
  ) -> Option<PathComponentIdRef> {
    self.resolve_path(&interaction.request.path)
  }

  pub fn resolve_path(&self, path: &str) -> Option<PathComponentIdRef> {
    let path = Self::extract_normalized_path(path);
    // eprintln!("{}", path);
    let mut path_components = path.split('/');
    // skip leading empty
    path_components.next();
    let mut last_resolved_path_id = Some(ROOT_PATH_ID);
    while let Some(s) = path_components.next() {
      // eprintln!("trying to match segment {}", s);
      let node_index = self
        .graph_get_index(last_resolved_path_id.unwrap())
        .expect("expected a node with node_id to exist");

      last_resolved_path_id = None;

      // first search for named path components
      let children = self.graph_get_children(node_index);
      for child in children {
        let child_node = self.endpoint_projection.graph.node_weight(child).unwrap();

        match child_node {
          Node::PathComponent(id, descriptor) => {
            // eprintln!("1 - neighbor {}", descriptor.name);
            if !descriptor.is_parameter {
              if descriptor.name == s {
                last_resolved_path_id = Some(id);
                break;
              }
            }
          }
          _ => {}
        }
      }
      if let Some(x) = last_resolved_path_id {
        continue;
      }
      // try path parameters since we didn't find any matches in regular path components
      let children = self.graph_get_children(node_index);
      for child in children {
        let child_node = self.endpoint_projection.graph.node_weight(child).unwrap();
        match child_node {
          Node::PathComponent(id, descriptor) => {
            // eprintln!("2 - neighbor {}", descriptor.name);

            if descriptor.is_parameter {
              last_resolved_path_id = Some(id);
              break;
            }
          }
          _ => {}
        }
      }
      if let Some(x) = last_resolved_path_id {
        continue;
      }
      return None;
    }
    last_resolved_path_id
  }

  pub fn resolve_operations_by_request_method(
    &self,
    method: &'a String,
    path_id: PathComponentIdRef,
  ) -> impl Iterator<Item = (&RequestId, &RequestBodyDescriptor)> {
    self
      .resolve_requests(path_id, method)
      .expect("expected a operations to exist")
  }

  pub fn resolve_operations(
    &self,
    interaction: &'a HttpInteraction,
    path_id: PathComponentIdRef,
  ) -> impl Iterator<Item = (&RequestId, &RequestBodyDescriptor)> {
    self.resolve_operations_by_request_method(&interaction.request.method, path_id)
  }

  pub fn resolve_requests(
    &self,
    path_id: PathComponentIdRef,
    method: &'a String,
  ) -> Option<impl Iterator<Item = (&RequestId, &RequestBodyDescriptor)>> {
    let path_node_index = self.graph_get_index(path_id)?;
    let children = self
      .endpoint_projection
      .graph
      .neighbors_directed(*path_node_index, petgraph::Direction::Incoming);
    let matching_method = children
      .filter(move |i| {
        let node = self.endpoint_projection.graph.node_weight(*i).unwrap();
        match node {
          Node::HttpMethod(http_method) => method == http_method,
          _ => false,
        }
      })
      .flat_map(move |i| {
        let children = self
          .endpoint_projection
          .graph
          .neighbors_directed(i, petgraph::Direction::Incoming);

        let operations = children.filter_map(move |i| {
          let node = self.endpoint_projection.graph.node_weight(i).unwrap();
          match node {
            Node::Request(request_id, request_descriptor) => Some((request_id, request_descriptor)),
            _ => None,
          }
        });
        operations
      });
    Some(matching_method)
  }

  pub fn resolve_request_by_method_and_content_type(
    &self,
    path_id: PathComponentIdRef,
    method: &'a String,
    content_type: Option<&'a String>,
  ) -> Option<(&RequestId, &RequestBodyDescriptor)> {
    self.resolve_requests(path_id, method).and_then(|mut it| {
      it.find(|(id, body)| match content_type {
        Some(content_type) => match body.body {
          Some(ref body) => body.http_content_type.eq(content_type),
          None => false,
        },
        None => body.body.is_none(),
      })
    })
  }

  pub fn resolve_responses(
    &self,
    interaction: &'a HttpInteraction,
    path_id: PathComponentIdRef,
  ) -> impl Iterator<Item = (&ResponseId, &ResponseBodyDescriptor)> {
    self.resolve_responses_by_method_and_status_code(
      &interaction.request.method,
      interaction.response.status_code,
      path_id,
    )
  }

  pub fn resolve_response_by_method_status_code_and_content_type(
    &self,
    path_id: PathComponentIdRef,
    method: &'a str,
    status_code: u16,
    content_type: Option<&'a String>,
  ) -> Option<(&ResponseId, &ResponseBodyDescriptor)> {
    self
      .resolve_responses_by_method_and_status_code(method, status_code, path_id)
      .find(|(id, body)| match content_type {
        Some(content_type) => match body.body {
          Some(ref body) => body.http_content_type.eq(content_type),
          None => false,
        },
        None => body.body.is_none(),
      })
  }

  pub fn resolve_responses_by_method_and_status_code(
    &self,
    method: &'a str,
    status_code: u16,
    path_id: PathComponentIdRef,
  ) -> impl Iterator<Item = (&ResponseId, &ResponseBodyDescriptor)> {
    let path_node_index = self
      .graph_get_index(path_id)
      .expect("expected a node with node_id to exist");
    let children = self
      .endpoint_projection
      .graph
      .neighbors_directed(*path_node_index, petgraph::Direction::Incoming);
    let matching_status_code = children
      .filter(move |i| {
        let node = self.endpoint_projection.graph.node_weight(*i).unwrap();
        // eprintln!("method node {:?}", node);
        match node {
          Node::HttpMethod(http_method) => method == *http_method,
          _ => false,
        }
      })
      .flat_map(move |i| {
        // eprintln!("method node id {:?}", i);
        let children = self
          .endpoint_projection
          .graph
          .neighbors_directed(i, petgraph::Direction::Incoming);
        let status_code_nodes = children.filter_map(move |i| {
          // eprintln!("method child node id {:?}", i);
          let node = self.endpoint_projection.graph.node_weight(i).unwrap();
          match node {
            Node::HttpStatusCode(http_status_code) => {
              // eprintln!("status code {:?}", http_status_code);
              if status_code == *http_status_code {
                Some(i)
              } else {
                None
              }
            }
            _ => None,
          }
        });
        status_code_nodes
      })
      .flat_map(move |i| {
        let children = self
          .endpoint_projection
          .graph
          .neighbors_directed(i, petgraph::Direction::Incoming);
        let response_nodes = children.filter_map(move |i| {
          // eprintln!("status_code child node id {:?}", i);
          let node = self.endpoint_projection.graph.node_weight(i).unwrap();
          // eprintln!("status_code child node {:?}", node);
          match node {
            Node::Response(response_id, response_descriptor) => {
              Some((response_id, response_descriptor))
            }
            _ => None,
          }
        });
        response_nodes
      });
    matching_status_code
  }

  fn graph_get_index(&self, node_id: &str) -> Option<&petgraph::graph::NodeIndex> {
    self.endpoint_projection.node_id_to_index.get(node_id)
  }

  fn graph_get_node(&self, node_id: &str) -> &Node {
    self
      .endpoint_projection
      .graph
      .node_weight(
        *self
          .graph_get_index(node_id)
          .expect("expected a node with node_id to exist"),
      )
      .expect("expected node with node_id to exist")
  }

  fn graph_get_children(
    &self,
    node_index: &petgraph::graph::NodeIndex,
  ) -> petgraph::graph::Neighbors<Edge> {
    let neighbors = self
      .endpoint_projection
      .graph
      .neighbors_directed(*node_index, petgraph::Direction::Incoming);
    return neighbors;
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use serde_json::json;
  fn interaction_with_path(path: String) -> HttpInteraction {
    serde_json::from_value(json!(
      {
        "uuid": "id",
        "request": {
          "host": "example.com",
          "method": "GET",
          "path": path,
          "query": {
            "shapeHashV1Base64": null,
            "asJsonString": null,
            "asText": null
          },
          "headers": {
            "shapeHashV1Base64": null,
            "asJsonString": null,
            "asText": null
          },
          "body": {
            "contentType": null,
            "value": {
              "shapeHashV1Base64": null,
              "asJsonString": null,
              "asText": null
            }
          }
        },
        "response": {
          "statusCode": 200,
          "headers": {
            "shapeHashV1Base64": null,
            "asJsonString": null,
            "asText": null
          },
          "body": {
            "contentType": null,
            "value": {
              "shapeHashV1Base64": null,
              "asJsonString": null,
              "asText": null
            }
          }
        },
        "tags": []
      }
    ))
    .unwrap()
  }
  #[test]
  pub fn can_ignore_trailing_slash() {
    let interaction: HttpInteraction = interaction_with_path(String::from("/a/b/c/"));
    let normalized_path = EndpointQueries::extract_normalized_path(&interaction.request.path);
    assert_eq!(normalized_path, "/a/b/c")
  }

  #[test]
  pub fn can_handle_no_trailing_slash() {
    let interaction: HttpInteraction = interaction_with_path(String::from("/a/b/c"));
    let normalized_path = EndpointQueries::extract_normalized_path(&interaction.request.path);
    assert_eq!(normalized_path, "/a/b/c")
  }
  #[test]
  pub fn can_handle_root_path() {
    let interaction: HttpInteraction = interaction_with_path(String::from("/"));
    let normalized_path = EndpointQueries::extract_normalized_path(&interaction.request.path);
    assert_eq!(normalized_path, "/")
  }
}
