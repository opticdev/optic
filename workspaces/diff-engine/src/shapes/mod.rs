use crate::state::body::BodyDescriptor;

mod result;
pub mod traverser;
pub mod visitors;

use crate::learn_shape::TrailObservationsResult;
use crate::projections::shape::ShapeProjection;
use crate::queries::shape::ShapeQueries;
use crate::state::shape::ShapeId;
use crate::InteractionDiffResult;
pub use result::ShapeDiffResult;
use std::collections::HashMap;
pub use traverser::{JsonTrail, JsonTrailPathComponent, ShapeTrail, ShapeTrailPathComponent};
use visitors::BodyVisitors;

/// Compute the diff between a (normalized) body and a shape defintion from a spec.
pub fn diff(
  shapes_projection: &ShapeProjection,
  body: Option<BodyDescriptor>,
  shape_id: &ShapeId,
) -> Vec<ShapeDiffResult> {
  let shapes_queries = ShapeQueries::new(shapes_projection);
  let shape_traverser = traverser::Traverser::new(&shapes_queries);
  let mut diff_visitors = visitors::diff::DiffVisitors::new();

  //dbg!(
  //   &shape_id, &body
  // );

  shape_traverser.traverse_root_shape(body, shape_id, &mut diff_visitors);

  diff_visitors.take_results().unwrap()
}

pub fn analyze_trail_values(
  body: Option<&BodyDescriptor>,
  diff_results: impl IntoIterator<Item = InteractionDiffResult>,
) -> impl Iterator<Item = TrailObservationsResult> {
  diff_results
    .into_iter()
    .map(|diff_result| TrailObservationsResult::default())
}
