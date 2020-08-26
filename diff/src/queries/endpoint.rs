use crate::projections::endpoint::{Edge, EndpointProjection, Node, ROOT_PATH_ID};
use crate::state::endpoint::{HttpMethod, PathComponentId, PathComponentIdRef};
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
  pub fn resolve_path(&self, interaction: &HttpInteraction) -> Option<PathComponentIdRef> {
    // println!("{}", path);
    let mut path_components = interaction.request.path.split('/');
    // skip leading empty
    path_components.next();
    let mut last_resolved_path_id = Some(ROOT_PATH_ID);
    while let Some(s) = path_components.next() {
      // println!("trying to match segment {}", s);
      let node_index = self.graph_get_index(last_resolved_path_id.unwrap());

      last_resolved_path_id = None;

      // first search for named path components
      let children = self.graph_get_children(node_index);
      for child in children {
        let child_node = self.endpoint_projection.graph.node_weight(child).unwrap();

        match child_node {
          Node::PathComponent(id, descriptor) => {
            // println!("1 - neighbor {}", descriptor.name);
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
            // println!("2 - neighbor {}", descriptor.name);

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

  pub fn resolve_operations(
    &self,
    interaction: &HttpInteraction,
    path_id: PathComponentId,
  ) -> impl Iterator<Item = &Node> {
    std::iter::empty()
    // let path_node_index = self.graph_get_index(&path_id);
    // let children = self
    //   .endpoint_projection
    //   .graph
    //   .neighbors_directed(*path_node_index, petgraph::Direction::Incoming);
    // let matching_method = children
    //   .filter(|i| {
    //     let node = self.endpoint_projection.graph.node_weight(*i).unwrap();
    //     match node {
    //       Node::HttpMethod(http_method) => interaction.request.method == *http_method,
    //       _ => false,
    //     }
    //   })
    //   .flat_map(|i| {
    //     let children = self
    //       .endpoint_projection
    //       .graph
    //       .neighbors_directed(i, petgraph::Direction::Incoming);
    //     let operations = children.filter_map(|i| {
    //       let node = self.endpoint_projection.graph.node_weight(i).unwrap();
    //       match node {
    //         Node::Request(request_id, request_descriptor) => Some(node),
    //         _ => None,
    //       }
    //     });
    //     operations
    //   });
    // matching_method
  }

  fn graph_get_index(&self, node_id: &str) -> &petgraph::graph::NodeIndex {
    return self
      .endpoint_projection
      .node_id_to_index
      .get(node_id)
      .expect("expected a node with node_id to exist");
  }

  fn graph_get_node(&self, node_id: &str) -> &Node {
    self
      .endpoint_projection
      .graph
      .node_weight(*self.graph_get_index(node_id))
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
