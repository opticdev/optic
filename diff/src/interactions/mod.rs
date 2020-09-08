pub mod result;
mod traverser;
mod visitors;
pub use crate::events::http_interaction::HttpInteraction;
pub use crate::projections::endpoint::EndpointProjection;
pub use crate::projections::SpecProjection;
pub use crate::queries::endpoint::EndpointQueries;
pub use result::InteractionDiffResult;
use visitors::{InteractionVisitors, PathVisitor};

pub fn diff(
  spec_projection: &SpecProjection,
  http_interaction: HttpInteraction,
) -> Vec<InteractionDiffResult> {
  let endpoint_projection = spec_projection.endpoint();
  let endpoint_queries = EndpointQueries::new(endpoint_projection);
  let interaction_traverser = traverser::Traverser::new(&endpoint_queries);
  let mut diff_visitors = visitors::diff::DiffVisitors::new();

  interaction_traverser.traverse(http_interaction, &mut diff_visitors);

  diff_visitors.take_results().unwrap()
}

#[cfg(test)]
mod test {
  #[test]
  pub fn try_diff() {
    assert_eq!(true, true);
  }
}
