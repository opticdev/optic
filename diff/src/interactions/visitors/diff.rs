use super::{
  InteractionVisitor, InteractionVisitors, PathVisitor, PathVisitorContext, VisitorResults,
};
use crate::interactions::diff::{InteractionDiffResult, UnmatchedRequestUrl};
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

impl InteractionVisitors<InteractionDiffResult> for DiffVisitors {
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

impl InteractionVisitor<InteractionDiffResult> for DiffPathVisitor {
  fn results(&mut self) -> Option<&mut DiffResults> {
    Some(&mut self.results)
  }
}

impl PathVisitor<InteractionDiffResult> for DiffPathVisitor {
  fn visit(&mut self, interaction: &HttpInteraction, context: PathVisitorContext) {
    if let None = context.path {
      let interaction_trail = InteractionTrail::empty();
      let requests_trail = RequestSpecTrail::SpecRoot;
      let diff = InteractionDiffResult::UnmatchedRequestUrl(UnmatchedRequestUrl::new(
        interaction_trail,
        requests_trail,
      ));
      self.push(diff);
    }
  }
}
