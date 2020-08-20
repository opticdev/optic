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

  return extract_results(&mut diff_visitors);
}

//@NOTE it feels weird that I have to do this - not sure the best way to "cast" diff_visitors in line 20 above so I copied this way of doing it.
fn extract_results(
  visitors: &mut impl InteractionVisitors<InteractionDiffResult>,
) -> Vec<InteractionDiffResult> {
  visitors.take_results().unwrap()
}

#[cfg(test)]
mod test {
  #[test]
  pub fn try_diff() {
    assert_eq!(true, true);
  }
}
