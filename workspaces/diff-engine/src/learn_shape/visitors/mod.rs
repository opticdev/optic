mod learn_shape_visitor;
use crate::queries::shape::ChoiceOutput;
use crate::state::body::BodyDescriptor;
use crate::state::shape::{FieldId, ShapeId, ShapeKind};
use serde_json::Value as JsonValue;
use crate::shapes::JsonTrail;
use crate::shapes::visitors::VisitorResults;

pub trait JsonVisitors<R> {
  type Array: JsonArrayVisitor<R>;
  type Object: JsonObjectVisitor<R>;
  type ObjectKey: JsonObjectKeyVisitor<R>;
  type Primitive: JsonPrimitiveVisitor<R>;

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

pub trait JsonVisitor<R> {
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

pub trait JsonObjectVisitor<R>: JsonVisitor<R> {
  fn visit(
    &mut self,
    body: &BodyDescriptor,
    json_trail: &JsonTrail,
  );
}

pub trait JsonObjectKeyVisitor<R>: JsonVisitor<R> {
  fn visit(
    &mut self,
    object_json_trail: &JsonTrail,
    object_keys: &Vec<String>
  );
}

pub trait JsonArrayVisitor<R>: JsonVisitor<R> {
  fn visit(
    &mut self,
    body: &BodyDescriptor,
    json_trail: &JsonTrail,
  );
}

pub trait JsonPrimitiveVisitor<R>: JsonVisitor<R> {
  fn visit(
    &mut self,
    body: BodyDescriptor,
    json_trail: JsonTrail,
  );
}
