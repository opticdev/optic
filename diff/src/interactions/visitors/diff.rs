use super::{
  InteractionVisitors, PathVisitor, PathVisitorContext, VisitorResults, VisitorWithResults,
};
use crate::interactions::diff::{InteractionDiffResult, UnmatchedRequestMethod};
use crate::interactions::diff::{InteractionTrail, RequestSpecTrail};
use crate::interactions::HttpInteraction;

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

type DiffResults = VisitorResults<InteractionDiffResult>;

impl InteractionVisitors for DiffVisitors {
  type Path = DiffPathVisitor;
  fn path(&mut self) -> &mut DiffPathVisitor {
    &mut self.path
  }
}

pub struct DiffPathVisitor {
  results: DiffResults,
}

impl DiffPathVisitor {
  fn new() -> Self {
    DiffPathVisitor {
      results: DiffResults::new(),
    }
  }
}

impl VisitorWithResults<InteractionDiffResult> for DiffPathVisitor {
  fn results(&mut self) -> &mut DiffResults {
    &mut self.results
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
