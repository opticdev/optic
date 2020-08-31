use super::{
  InteractionVisitor, InteractionVisitors, PathVisitor, PathVisitorContext, RequestBodyVisitor,
  VisitorResults,
};
use crate::interactions::diff::{InteractionDiffResult, UnmatchedRequestUrl};
use crate::interactions::diff::{InteractionTrail, RequestSpecTrail, SpecRoot};
use crate::interactions::HttpInteraction;

pub struct DiffVisitors {
  path: DiffPathVisitor,
  request_body: DiffRequestBodyVisitor,
}

impl DiffVisitors {
  pub fn new() -> Self {
    DiffVisitors {
      path: DiffPathVisitor::new(),
      request_body: DiffRequestBodyVisitor::new(),
    }
  }
}

type DiffResults = VisitorResults<InteractionDiffResult>;

impl InteractionVisitors<InteractionDiffResult> for DiffVisitors {
  type Path = DiffPathVisitor;
  type RequestBody = DiffRequestBodyVisitor;

  fn path(&mut self) -> &mut DiffPathVisitor {
    &mut self.path
  }
  fn request_body(&mut self) -> &mut DiffRequestBodyVisitor {
    &mut self.request_body
  }
}

pub struct DiffPathVisitor {
  results: DiffResults,
}

pub struct DiffRequestBodyVisitor {
  results: DiffResults,
}

impl DiffPathVisitor {
  fn new() -> Self {
    DiffPathVisitor {
      results: DiffResults::new(),
    }
  }
}

impl DiffRequestBodyVisitor {
  fn new() -> Self {
    DiffRequestBodyVisitor {
      results: DiffResults::new(),
    }
  }
}

impl InteractionVisitor<InteractionDiffResult> for DiffPathVisitor {
  fn results(&mut self) -> Option<&mut DiffResults> {
    Some(&mut self.results)
  }
}
impl InteractionVisitor<InteractionDiffResult> for DiffRequestBodyVisitor {
  fn results(&mut self) -> Option<&mut DiffResults> {
    Some(&mut self.results)
  }
}
impl RequestBodyVisitor<InteractionDiffResult> for DiffRequestBodyVisitor {
  fn begin(&mut self) {
    // eprintln!("begin");
  }

  fn end(&mut self) {
    // eprintln!("end");
  }
}

impl PathVisitor<InteractionDiffResult> for DiffPathVisitor {
  fn visit(&mut self, interaction: &HttpInteraction, context: PathVisitorContext) {
    if let None = context.path {
      let interaction_trail = InteractionTrail::empty();
      let requests_trail = RequestSpecTrail::SpecRoot(SpecRoot {});
      let diff = InteractionDiffResult::UnmatchedRequestUrl(UnmatchedRequestUrl::new(
        interaction_trail,
        requests_trail,
      ));
      self.push(diff);
    }
  }
}
