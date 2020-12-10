pub mod result;
mod traverser;
mod visitors;
pub use crate::events::http_interaction::HttpInteraction;
pub use crate::projections::endpoint::EndpointProjection;
pub use crate::projections::SpecProjection;
pub use crate::queries::endpoint::EndpointQueries;
use crate::shapes::diff as diff_shape;
pub use result::InteractionDiffResult;
use visitors::{InteractionVisitors, PathVisitor};
use crate::BodyDescriptor;
use crate::protos::shapehash::ShapeDescriptor;
use crate::events::http_interaction::Body;
use crate::learn_shape::trail_values::for_body_descriptor;

pub fn diff(
  spec_projection: &SpecProjection,
  http_interaction: HttpInteraction,
) -> Vec<InteractionDiffResult> {
  let endpoint_projection = spec_projection.endpoint();
  let endpoint_queries = EndpointQueries::new(endpoint_projection);
  let interaction_traverser = traverser::Traverser::new(&endpoint_queries);
  let mut diff_visitors = visitors::diff::DiffVisitors::new();

  interaction_traverser.traverse(&http_interaction, &mut diff_visitors);

  let results = diff_visitors.take_results().unwrap();

  results
    .into_iter()
    .flat_map(move |result| match result {
      InteractionDiffResult::MatchedRequestBodyContentType(result) => {
        // eprintln!("shape diffing for matched a request body content type");
        let body = &http_interaction.request.body.value;
        let shape_diff_results =
          diff_shape(spec_projection.shape(), body.into(), &result.root_shape_id);
        shape_diff_results
          .into_iter()
          .map(|shape_diff| {
            InteractionDiffResult::UnmatchedRequestBodyShape(
              result.clone().into_shape_diff(shape_diff),
            )
          })
          .collect()
      }
      InteractionDiffResult::MatchedResponseBodyContentType(result) => {
        // eprintln!(
        //   "interaction-diff: shape diffing for matched a response body content type: {:?}",
        //   &http_interaction.response.body
        // );
        let body = &http_interaction.response.body.value;
        let shape_diff_results =
          diff_shape(spec_projection.shape(), body.into(), &result.root_shape_id);
        shape_diff_results
          .into_iter()
          .map(|shape_diff| {
            InteractionDiffResult::UnmatchedResponseBodyShape(
              result.clone().into_shape_diff(shape_diff),
            )
          })
          .collect()
      }
      _ => vec![result],
    })
    .collect()
}


pub struct BodyAnalysisResult {}
pub fn analyze_undocumented_bodies(
    spec_projection: &SpecProjection,
    http_interaction: HttpInteraction,
) -> Vec<BodyAnalysisResult> {
    let endpoint_projection = spec_projection.endpoint();
    let endpoint_queries = EndpointQueries::new(endpoint_projection);
    let interaction_traverser = traverser::Traverser::new(&endpoint_queries);
    let mut diff_visitors = visitors::diff::DiffVisitors::new();

    interaction_traverser.traverse(&http_interaction, &mut diff_visitors);

    let results = diff_visitors.take_results().unwrap();

    let body_analysis_results: Vec<BodyAnalysisResult> = results
        .into_iter()
        .flat_map(move |result| {
            match result {
                InteractionDiffResult::UnmatchedRequestBodyContentType(diff) => {
                    let body: Option<BodyDescriptor> = (&http_interaction.request.body.value).into();
                    let value_map = for_body_descriptor(body);
                    vec![BodyAnalysisResult{}]
                }
                InteractionDiffResult::UnmatchedResponseBodyContentType(diff) => {
                    vec![]

                }
                _ => vec![]
            }
        }).collect();

    body_analysis_results
}