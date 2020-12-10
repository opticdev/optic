use super::{
  BodyArrayVisitor, BodyObjectKeyVisitor, BodyObjectVisitor, BodyPrimitiveVisitor, BodyVisitor,
  VisitorResults,
};
use std::iter::FromIterator;
use crate::learn_shape::visitors::BodyVisitors;
use crate::queries::shape::ChoiceOutput;
use crate::shapes::{JsonTrail, JsonTrailPathComponent, ShapeTrail, ShapeTrailPathComponent};
use crate::state::body::BodyDescriptor;
use crate::state::shape::{FieldId, ShapeId, ShapeKind};
use serde_json::Value as JsonValue;
use std::borrow::Borrow;
use crate::learn_shape::TrailValues;
use std::collections::{HashSet, HashMap};
use std::collections::hash_map::RandomState;

pub struct LearnVisitors {
  array: LearnArrayVisitor,
  object: LearnObjectVisitor,
  object_key: LearnObjectKeyVisitor,
  primitive: LearnPrimitiveVisitor,
}

impl LearnVisitors {
  pub fn new() -> Self {
    LearnVisitors {
      array: LearnArrayVisitor::new(),
      object: LearnObjectVisitor::new(),
      object_key: LearnObjectKeyVisitor::new(),
      primitive: LearnPrimitiveVisitor::new(),
    }
  }
}

type LearnResults = VisitorResults<TrailValues>;

impl BodyVisitors<TrailValues> for LearnVisitors {
  type Array = LearnArrayVisitor;
  type Object = LearnObjectVisitor;
  type ObjectKey = LearnObjectKeyVisitor;
  type Primitive = LearnPrimitiveVisitor;

  fn array(&mut self) -> &mut LearnArrayVisitor {
    &mut self.array
  }

  fn object(&mut self) -> &mut LearnObjectVisitor {
    &mut self.object
  }

  fn object_key(&mut self) -> &mut LearnObjectKeyVisitor {
    &mut self.object_key
  }

  fn primitive(&mut self) -> &mut LearnPrimitiveVisitor {
    &mut self.primitive
  }

  fn take_results(&mut self) -> HashMap<JsonTrail, TrailValues, RandomState> {
    dbg!("@TODO merge self.object, array, etc.");
    self.primitive().take_results()
  }
}

// Primitive visitor
// -----------------

pub struct LearnPrimitiveVisitor {
  results: LearnResults,
}

impl LearnPrimitiveVisitor {
  pub fn new() -> Self {
    Self {
      results: LearnResults::new(),
    }
  }
}

impl BodyVisitor<TrailValues> for LearnPrimitiveVisitor {
  fn results(&mut self) -> Option<&mut LearnResults> {
    Some(&mut self.results)
  }
}

impl BodyPrimitiveVisitor<TrailValues> for LearnPrimitiveVisitor {
  fn visit(&mut self, body: BodyDescriptor, json_trail: JsonTrail) {
    if let None = self.get(&json_trail) {
      let value = TrailValues::new(&json_trail);
      self.insert(json_trail.clone(), value);
    }
    let trail_values =  self.get(&json_trail).expect("expected map to contain a value at the json_trail");

    dbg!(&trail_values);

    match body {
      BodyDescriptor::Boolean => trail_values.was_boolean = true,
      BodyDescriptor::Number => trail_values.was_number = true,
      BodyDescriptor::String => trail_values.was_string = true,
      BodyDescriptor::Null => trail_values.was_null = true,
      _ => unreachable!("should not call primitive visitor without a primitive value"),
    }

    dbg!(&trail_values);

  }
}

// Array visitor
// -------------

pub struct LearnArrayVisitor {
  results: LearnResults,
}

impl LearnArrayVisitor {
  pub fn new() -> Self {
    Self {
      results: LearnResults::new(),
    }
  }
}

impl BodyVisitor<TrailValues> for LearnArrayVisitor {
  fn results(&mut self) -> Option<&mut LearnResults> {
    Some(&mut self.results)
  }
}

impl BodyArrayVisitor<TrailValues> for LearnArrayVisitor {
  fn visit(&mut self, body: &BodyDescriptor, json_trail: &JsonTrail) {
    // self.push(TrailValues {
    //   trail: json_trail.clone(),
    //   was_array: true,
    //   was_boolean: false,
    //   was_string: false,
    //   was_number: false,
    //   was_object: false,
    //   was_null: false,
    //   field_set: Default::default()
    // });
  }
}

// Object visitor
// -------------

pub struct LearnObjectVisitor {
  results: LearnResults,
}

impl LearnObjectVisitor {
  pub fn new() -> Self {
    Self {
      results: LearnResults::new(),
    }
  }
}

impl BodyVisitor<TrailValues> for LearnObjectVisitor {
  fn results(&mut self) -> Option<&mut LearnResults> {
    Some(&mut self.results)
  }
}

impl BodyObjectVisitor<TrailValues> for LearnObjectVisitor {
  fn visit(&mut self, body: &BodyDescriptor, json_trail: &JsonTrail) {


    // dbg!(&body);
    // dbg!(&json_trail);

    if let BodyDescriptor::Object(object_description) = &body {
      let keys = object_description.keys().map(|x| (*x).clone());
      let keys_set = HashSet::<String>::from_iter(keys);

      // self.push(TrailValues {
      //   trail: json_trail.clone(),
      //   was_object: true,
      //   was_array: false,
      //   was_boolean: false,
      //   was_string: false,
      //   was_number: false,
      //   was_null: false,
      //   field_set:
      // });
      //
    }

  }
}

// Object Key visitor
// ------------------

pub struct LearnObjectKeyVisitor {
  results: LearnResults,
}

impl LearnObjectKeyVisitor {
  pub fn new() -> Self {
    Self {
      results: LearnResults::new(),
    }
  }
}

impl BodyVisitor<TrailValues> for LearnObjectKeyVisitor {
  fn results(&mut self) -> Option<&mut LearnResults> {
    Some(&mut self.results)
  }
}

impl BodyObjectKeyVisitor<TrailValues> for LearnObjectKeyVisitor {
  fn visit(&mut self, object_json_trail: &JsonTrail, object_keys: &Vec<String>) {}
}
