pub mod diff;

use super::HttpInteraction;
use crate::state::endpoint::{PathComponentId, PathComponentIdRef};

pub trait InteractionVisitors<R> {
  type Path: PathVisitor<R>;

  fn path(&mut self) -> &mut Self::Path;

  fn take_results(&mut self) -> Option<Vec<R>> {
    // TODO: flatten results once we have more types of visitors
    self.path().take_results()
  }
}

pub trait InteractionVisitor<R> {
  fn results(&mut self) -> Option<&mut VisitorResults<R>> {
    None
  }

  fn push(&mut self, result: R) {
    if let Some(results) = self.results() {
      results.push(result);
    }
  }

  fn take_results(&mut self) -> Option<Vec<R>> {
    if let Some(results) = self.results() {
      results.take_results()
    } else {
      None
    }
  }
}

pub trait PathVisitor<R>: InteractionVisitor<R> {
  fn visit(&mut self, interaction: &HttpInteraction, context: PathVisitorContext);
}

pub struct PathVisitorContext<'a> {
  pub path: Option<PathComponentIdRef<'a>>,
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

#[cfg(test)]
mod test {
  use super::*;

  type TestResults = VisitorResults<u8>;

  #[test]
  fn can_take_results() {
    let mut results = TestResults::new();

    results.push(0);
    results.push(1);

    let taken = results
      .take_results()
      .expect("results should have been recorded");

    assert_eq!(taken, vec![0, 1]);
    assert_eq!(
      results.take_results().unwrap(),
      vec![] as Vec<u8>,
      "taken results are flushed and won't be yielded again"
    );
  }
}
