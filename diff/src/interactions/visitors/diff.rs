use super::{InteractionVisitors, PathVisitor, PathVisitorContext};
use crate::interactions::diff::{InteractionDiffResult, UnmatchedRequestMethod};
use crate::interactions::diff::{InteractionTrail, RequestSpecTrail};
use crate::interactions::http_interaction::HttpInteraction;

pub struct DiffVisitors {
  path: DiffPathVisitor,
  // request body visitor
}

impl DiffVisitors {
  pub fn new() -> Self {
    DiffVisitors {
      path: DiffPathVisitor::new(),
    }
  }
}

impl InteractionVisitors for DiffVisitors {
  type Path = DiffPathVisitor;
  fn path(&mut self) -> &mut DiffPathVisitor {
    &mut self.path
  }
}

pub struct DiffPathVisitor {
  results: Option<Vec<InteractionDiffResult>>,
}

impl DiffPathVisitor {
  fn new() -> Self {
    DiffPathVisitor {
      results: Some(vec![]),
    }
  }

  fn push(&mut self, result: InteractionDiffResult) {
    if let Some(results) = &mut self.results {
      results.push(result);
    }
  }

  // TODO: consider moving to an emit / reactor pattern, so we don't own the results
  // in the first place.
  fn get_results(&mut self) -> Option<Vec<InteractionDiffResult>> {
    self.results.take()
  }
}

impl PathVisitor for DiffPathVisitor {
  fn visit(&mut self, interaction: HttpInteraction, context: PathVisitorContext) {
    if let None = context.path {
      let interaction_trail = InteractionTrail::empty();
      let requests_trail = RequestSpecTrail::SpecRoot;
      let diff = InteractionDiffResult::UnmatchedRequestMethod(UnmatchedRequestMethod::new(
        interaction_trail,
        requests_trail,
      ));
      self.push(diff);
    }
  }
}
