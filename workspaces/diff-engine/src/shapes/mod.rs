use crate::state::body::BodyDescriptor;

mod result;
pub mod traverser;
pub mod visitors;

pub use result::ShapeDiffResult;
pub use traverser::{JsonTrail, JsonTrailPathComponent, ShapeTrail, ShapeTrailPathComponent};

use crate::projections::shape::ShapeProjection;
use crate::queries::shape::ShapeQueries;
use crate::state::shape::ShapeId;
use visitors::BodyVisitors;

pub fn diff(
  shapes_projection: &ShapeProjection,
  body: Option<BodyDescriptor>,
  shape_id: &ShapeId,
) -> Vec<ShapeDiffResult> {
  let shapes_queries = ShapeQueries::new(shapes_projection);
  let shape_traverser = traverser::Traverser::new(&shapes_queries);
  let mut diff_visitors = visitors::diff::DiffVisitors::new();

  eprintln!(
    "shape-diff: diffing body with shape id {},  {:?}",
    shape_id, body
  );

  shape_traverser.traverse_root_shape(body, shape_id, &mut diff_visitors);

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
