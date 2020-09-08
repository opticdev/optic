use serde_json::Value as JsonValue;

mod result;
pub mod traverser;
pub mod visitors;

pub use result::ShapeDiffResult;
pub use traverser::{JsonTrail, ShapeTrail};

use crate::projections::shape::ShapeProjection;
use crate::queries::shape::ShapeQueries;
use crate::state::shape::ShapeId;
use visitors::JsonBodyVisitors;

pub fn diff(
  shapes_projection: &ShapeProjection,
  json_body: Option<JsonValue>,
  shape_id: &ShapeId,
) -> Vec<ShapeDiffResult> {
  let shapes_queries = ShapeQueries::new(shapes_projection);
  let shape_traverser = traverser::Traverser::new(&shapes_queries);
  let mut diff_visitors = visitors::diff::DiffVisitors::new();

  shape_traverser.traverse_root_shape(json_body, shape_id, &mut diff_visitors);

  diff_visitors.take_results().unwrap()
}

// pub fn diff(
//   endpoint_projection: &EndpointProjection,
//   http_interaction: HttpInteraction,
// ) -> Vec<InteractionDiffResult> {
//   let endpoint_queries = EndpointQueries::new(endpoint_projection);
//   let interaction_traverser = traverser::Traverser::new(&endpoint_queries);
//   let mut diff_visitors = visitors::diff::DiffVisitors::new();

//   interaction_traverser.traverse(http_interaction, &mut diff_visitors);

//   diff_visitors.take_results().unwrap()
// }
