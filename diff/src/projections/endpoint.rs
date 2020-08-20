use crate::events::{EndpointEvent, SpecEvent};
use crate::state::endpoint::PathComponentId;
use cqrs_core::{Aggregate, AggregateEvent};
use std::collections::HashMap;

pub struct EndpointProjection {
  pub absolute_paths: HashMap<PathComponentId, String>,
}

impl EndpointProjection {
  pub fn with_path(
    &mut self,
    parent_path_id: PathComponentId,
    path_id: PathComponentId,
    path_name: String,
  ) {
    let absolute_paths = &mut self.absolute_paths;

    let parent_absolute_path = absolute_paths
      .get(&parent_path_id)
      .expect("expected parent_path_id to already exist");
    let absolute_path = format!("{}/{}", &parent_absolute_path, &path_name);
    absolute_paths.insert(path_id, absolute_path);
  }
}

impl Default for EndpointProjection {
  fn default() -> Self {
    let mut absolute_paths = HashMap::new();
    absolute_paths.insert(PathComponentId::from("root"), String::from(""));
    EndpointProjection { absolute_paths }
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
        _ => {}
      }
    }
  }
}
