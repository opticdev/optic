pub mod diff;
pub mod http_interaction;
mod traverser;
mod visitors;

pub use diff::InteractionDiffResult;
pub use http_interaction::HttpInteraction;

pub fn diff(http_interaction: HttpInteraction) -> Vec<InteractionDiffResult> {
  let q = traverser::RequestsQueries {};
  let interaction_traverser = traverser::Traverser::new(&q);
  let mut diff_visitors = visitors::diff::DiffVisitors::new();

  interaction_traverser.traverse(http_interaction, &mut diff_visitors);

  // TODO: replace by extracting results from visitors
  vec![]
}

#[cfg(test)]
mod test {
  #[test]
  pub fn try_diff() {
    assert_eq!(true, true);
  }
}
