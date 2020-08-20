use crate::projections::endpoint::EndpointProjection;
use crate::state::endpoint::PathComponentId;

pub struct EndpointQueries<'a> {
  pub endpoint_projection: &'a EndpointProjection,
}

impl<'a> EndpointQueries<'a> {
  pub fn new(endpoint_projection: &'a EndpointProjection) -> Self {
    EndpointQueries {
      endpoint_projection,
    }
  }
  pub fn resolve_path(&self, path: &String) -> Option<&PathComponentId> {
    // self
    //   .endpoint_projection
    //   .absolute_paths
    //   .iter()
    //   .find_map(|(path_id, absolute_path)| {
    //     if path == absolute_path {
    //       Some(path_id)
    //     } else {
    //       None
    //     }
    //   })
    None
  }
}
