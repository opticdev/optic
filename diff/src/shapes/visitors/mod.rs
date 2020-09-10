use super::traverser::{JsonTrail, ShapeTrail};
use crate::queries::shape::ChoiceOutput;
use serde_json::Value as JsonValue;
pub mod diff;

pub trait JsonBodyVisitors<R> {
  type Array: JlasArrayVisitor<R>;
  type Primitive: JlasPrimitiveVisitor<R>;

  fn array(&mut self) -> &mut Self::Array;
  fn primitive(&mut self) -> &mut Self::Primitive;

  fn take_results(&mut self) -> Option<Vec<R>> {
    let flattened = vec![self.primitive().take_results(), self.array().take_results()]
      .into_iter()
      .filter_map(|x| x)
      .flatten()
      .collect();
    Some(flattened)
  }
}

pub trait JsonBodyVisitor<R> {
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

pub trait JlasObjectVisitor<R>: JsonBodyVisitor<R> {
  // fn visit(json: JsonLike, jsonTrail: JsonTrail, trailOrigin: ShapeTrail, trailChoices: Seq<ChoiceOutput>, itemChoiceCallback: ObjectKeyChoiceCallback);
}

pub trait JlasObjectKeyVisitor<R>: JsonBodyVisitor<R> {
  //fn visit(objectJsonTrail: JsonTrail, objectKeys: Map<String>, objectChoices: Seq<ChoiceOutput>);
}

pub trait JlasArrayVisitor<R>: JsonBodyVisitor<R> {
  fn visit(
    &mut self,
    json: &JsonValue,
    json_trail: &JsonTrail,
    trail_origin: &ShapeTrail,
    trail_choices: &Vec<ChoiceOutput>,
  ) -> Vec<ChoiceOutput>;
}

pub trait JlasPrimitiveVisitor<R>: JsonBodyVisitor<R> {
  fn visit(
    &mut self,
    json: JsonValue,
    json_trail: JsonTrail,
    trail_origin: ShapeTrail,
    trail_choices: &Vec<ChoiceOutput>,
  );
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
