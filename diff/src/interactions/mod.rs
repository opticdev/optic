pub mod diff;
mod traverser;
mod visitors;
pub use crate::events::http_interaction::HttpInteraction;
pub use crate::projections::endpoint::EndpointProjection;
pub use crate::queries::endpoint::EndpointQueries;
pub use diff::InteractionDiffResult;
use visitors::{InteractionVisitors, PathVisitor};

pub fn diff(
  endpoint_projection: &EndpointProjection,
  http_interaction: HttpInteraction,
) -> Vec<InteractionDiffResult> {
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
