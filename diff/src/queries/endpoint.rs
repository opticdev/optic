use crate::projections::endpoint::EndpointProjection;
use crate::state::endpoint::PathComponentId;

pub struct EndpointQueries<'a> {
  endpoint_projection: &'a EndpointProjection,
}

impl<'a> EndpointQueries<'a> {
  pub fn new(endpoint_projection: &'a EndpointProjection) -> Self {
    EndpointQueries {
      endpoint_projection,
    }
  }
  pub fn resolve_path(&self, path: String) -> Option<PathComponentId> {
    None
  }
}
