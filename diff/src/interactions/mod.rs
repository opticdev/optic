mod diff;
pub mod http_interaction;
mod traverser;

use diff::InteractionDiffResult;
pub use http_interaction::HttpInteraction;

pub fn diff(http_interaction: HttpInteraction) -> Vec<InteractionDiffResult> {
  let diff_result =
    InteractionDiffResult::UnmatchedRequestMethod(diff::UnmatchedRequestMethod::new(
      diff::InteractionTrail {
        path: vec![diff::InteractionTrailPathComponent::Method(String::from(
          "GET",
        ))],
      },
      diff::RequestSpecTrail {},
    ));

  vec![diff_result]
}

#[cfg(test)]
mod test {
  #[test]
  pub fn try_diff() {
    assert_eq!(true, true);
  }
}
