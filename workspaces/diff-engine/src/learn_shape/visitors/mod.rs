use crate::shapes::JsonTrail;
use crate::state::body::BodyDescriptor;
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use crate::learn_shape::TrailValues;
use std::borrow::Borrow;

pub mod learn_json_values;

pub trait BodyVisitors<R> {
  type Array: BodyArrayVisitor<R>;
  type Object: BodyObjectVisitor<R>;
  type ObjectKey: BodyObjectKeyVisitor<R>;
  type Primitive: BodyPrimitiveVisitor<R>;

  fn array(&mut self) -> &mut Self::Array;
  fn object(&mut self) -> &mut Self::Object;
  fn object_key(&mut self) -> &mut Self::ObjectKey;
  fn primitive(&mut self) -> &mut Self::Primitive;

  fn take_results(&mut self) -> HashMap<JsonTrail, R> {
    HashMap::new()
  }
}

pub trait BodyVisitor<R> {

  fn results(&mut self) -> Option<&mut VisitorResults<R>> {
    None
  }

  fn insert(&mut self, json_trail: JsonTrail, result: R) {
    if let Some(results) = self.results() {
      results.insert(json_trail, result)
    }
  }
  fn get(&mut self, json_trail: &JsonTrail) -> Option<&mut R> {
    if let Some(results) = self.results() {
      results.get(json_trail)
    } else {
      None
    }
  }

  fn take_results(&mut self) -> HashMap<JsonTrail, R> {
    if let Some(results) = self.results() {
      results.take_results()
    } else {
    HashMap::new()
    }
  }
}

pub trait BodyObjectVisitor<R>: BodyVisitor<R> {
  fn visit(&mut self, body: &BodyDescriptor, json_trail: &JsonTrail);
}

pub trait BodyObjectKeyVisitor<R>: BodyVisitor<R> {
  fn visit(&mut self, object_json_trail: &JsonTrail, object_keys: &Vec<String>);
}

pub trait BodyArrayVisitor<R>: BodyVisitor<R> {
  fn visit(&mut self, body: &BodyDescriptor, json_trail: &JsonTrail);
}

pub trait BodyPrimitiveVisitor<R>: BodyVisitor<R> {
  fn visit(&mut self, body: BodyDescriptor, json_trail: JsonTrail);
}

// Results
// -------

pub struct VisitorResults<R> {
  results: Option<HashMap<JsonTrail, R>>
}

impl<R> VisitorResults<R> {
  pub fn new() -> Self {
    VisitorResults {
      results:Some(HashMap::new()),
    }
  }

  pub fn get(&mut self, json_trail:&JsonTrail) -> Option<&mut R> {
    self.results.as_mut().expect("expected results to be present").get_mut(&json_trail)
  }

  pub fn insert(&mut self, json_trail: JsonTrail, result: R) {
    self.results.as_mut().expect("expected results to be present").insert(json_trail, result);
  }

  pub fn take_results(&mut self) -> HashMap<JsonTrail, R> {
    let  results = self.results.take();
    self.results = Some(HashMap::new());
    results.expect("expected results to be present")
  }
}
