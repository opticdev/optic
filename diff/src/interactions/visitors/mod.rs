pub mod diff;

use super::HttpInteraction;
use crate::state::endpoint::PathComponentId;

pub trait InteractionVisitors {
  type Path: PathVisitor;

  fn path(&mut self) -> &mut Self::Path;
}

pub trait PathVisitor {
  fn visit(&mut self, interaction: HttpInteraction, context: PathVisitorContext);
}

pub struct PathVisitorContext {
  path: Option<PathComponentId>,
}

// Results
// -------

pub struct VisitorResults<R> {
  results: Option<Vec<R>>,
}

impl<R> VisitorResults<R> {
  fn new() -> Self {
    VisitorResults {
      results: Some(vec![]),
    }
  }

  fn push(&mut self, result: R) {
    if let Some(results) = &mut self.results {
      results.push(result);
    }
  }

  fn take_results(&mut self) -> Option<Vec<R>> {
    let flushed_results = self.results.take();
    self.results = Some(vec![]);
    flushed_results
  }
}
