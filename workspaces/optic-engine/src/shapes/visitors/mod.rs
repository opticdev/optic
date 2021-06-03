use super::traverser::{JsonTrail, ShapeTrail};
use crate::queries::shape::ChoiceOutput;
use crate::state::body::BodyDescriptor;
use crate::state::shape::{FieldId, ShapeId, ShapeKind};
use serde_json::Value as JsonValue;
pub mod diff;

pub trait BodyVisitors<R> {
  type Array: BodyArrayVisitor<R>;
  type Object: BodyObjectVisitor<R>;
  type ObjectKey: BodyObjectKeyVisitor<R>;
  type Primitive: BodyPrimitiveVisitor<R>;

  fn array(&mut self) -> &mut Self::Array;
  fn object(&mut self) -> &mut Self::Object;
  fn object_key(&mut self) -> &mut Self::ObjectKey;
  fn primitive(&mut self) -> &mut Self::Primitive;

  fn take_results(&mut self) -> Option<Vec<R>> {
    let flattened = vec![
      self.primitive().take_results(),
      self.array().take_results(),
      self.object().take_results(),
      self.object_key().take_results(),
    ]
    .into_iter()
    .filter_map(|x| x)
    .flatten()
    .collect();
    Some(flattened)
  }
}

pub trait BodyVisitor<R> {
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

pub trait BodyObjectVisitor<R>: BodyVisitor<R> {
  fn visit(
    &mut self,
    body: &BodyDescriptor,
    json_trail: &JsonTrail,
    trail_origin: &ShapeTrail,
    trail_choices: &Vec<ChoiceOutput>,
  ) -> Vec<ChoiceOutput>;
}

pub trait BodyObjectKeyVisitor<R>: BodyVisitor<R> {
  fn visit(
    &mut self,
    object_json_trail: &JsonTrail,
    object_keys: &Vec<String>,
    object_and_field_choices: &Vec<(&ChoiceOutput, Vec<(String, FieldId, ShapeId, &ShapeKind)>)>,
  );
}

pub trait BodyArrayVisitor<R>: BodyVisitor<R> {
  fn visit(
    &mut self,
    body: &BodyDescriptor,
    json_trail: &JsonTrail,
    trail_origin: &ShapeTrail,
    trail_choices: &Vec<ChoiceOutput>,
  ) -> Vec<ChoiceOutput>;
}

pub trait BodyPrimitiveVisitor<R>: BodyVisitor<R> {
  fn visit(
    &mut self,
    body: BodyDescriptor,
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
  pub fn new() -> Self {
    VisitorResults {
      results: Some(vec![]),
    }
  }

  pub fn push(&mut self, result: R) {
    if let Some(results) = &mut self.results {
      results.push(result);
    }
  }

  pub fn take_results(&mut self) -> Option<Vec<R>> {
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
