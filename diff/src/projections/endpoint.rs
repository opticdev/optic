use crate::events::{EndpointEvent, SpecEvent};
use crate::state::endpoint::PathComponentId;
use cqrs_core::{Aggregate, AggregateEvent};
use std::collections::HashMap;

#[derive(Debug)]
pub struct PathComponentDescriptor {
  pub is_parameter: bool,
  pub parent_path_id: PathComponentId,
  pub name: String,
}
pub struct EndpointProjection {
  pub path_components: HashMap<PathComponentId, PathComponentDescriptor>,
}

impl EndpointProjection {
  pub fn with_path(
    &mut self,
    parent_path_id: PathComponentId,
    path_id: PathComponentId,
    path_name: String,
  ) {
    let path_components = &mut self.path_components;
    path_components.insert(
      path_id,
      PathComponentDescriptor {
        is_parameter: false,
        name: path_name,
        parent_path_id: parent_path_id,
      },
    );
  }

  pub fn with_path_parameter(
    &mut self,
    parent_path_id: PathComponentId,
    path_id: PathComponentId,
    path_name: String,
  ) {
    let path_components = &mut self.path_components;
    path_components.insert(
      path_id,
      PathComponentDescriptor {
        is_parameter: true,
        name: path_name,
        parent_path_id: parent_path_id,
      },
    );
  }
}

impl Default for EndpointProjection {
  fn default() -> Self {
    let mut path_components = HashMap::new();
    let root_id = PathComponentId::from("root");
    path_components.insert(
      root_id,
      PathComponentDescriptor {
        is_parameter: false,
        parent_path_id: String::from(""),
        name: String::from(""),
      },
    );
    EndpointProjection { path_components }
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
          aggregate.with_path_parameter(e.parent_path_id, e.path_id, e.name);
        }
        _ => {}
      }
    }
  }
}
