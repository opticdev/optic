mod diff;
mod traverser;
pub mod visitors;

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
