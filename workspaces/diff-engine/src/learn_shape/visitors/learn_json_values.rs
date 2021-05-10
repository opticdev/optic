use super::{
  BodyArrayVisitor, BodyObjectKeyVisitor, BodyObjectVisitor, BodyPrimitiveVisitor, BodyVisitor,
  TrailValues, VisitorResults,
};
use crate::learn_shape::visitors::BodyVisitors;
use crate::queries::shape::ChoiceOutput;
use crate::shapes::{JsonTrail, JsonTrailPathComponent, ShapeTrail, ShapeTrailPathComponent};
use crate::state::body::BodyDescriptor;
use crate::state::shape::{FieldId, ShapeId, ShapeKind};
use serde_json::Value as JsonValue;
use std::borrow::Borrow;
use std::collections::hash_map::RandomState;
use std::collections::{HashMap, HashSet};
use std::iter::FromIterator;

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
    let mut total_results = HashMap::new();
    let visitors_results = vec![
      self.array().take_results(),
      self.object().take_results(),
      self.object_key().take_results(),
      self.primitive().take_results(),
    ];

    for visitor_results in visitors_results {
      for (json_trail, trail_values) in visitor_results {
        let existing_values = total_results
          .entry(json_trail)
          .or_insert_with_key(|trail| TrailValues::from(trail.clone()));

        existing_values.union(trail_values)
      }
    }

    total_results
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

    let trail_values = self
      .get(&json_trail)
      .expect("execpted map to contain a value at the json_trail");

    match body {
      BodyDescriptor::Boolean => trail_values.was_boolean = true,
      BodyDescriptor::Number => trail_values.was_number = true,
      BodyDescriptor::String => trail_values.was_string = true,
      BodyDescriptor::Null => trail_values.was_null = true,
      _ => unreachable!("should not call primitive visitor without a primitive value"),
    }
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
    let trail_values = self.get_or_insert(json_trail);
    trail_values.was_array = true;

    let items = match body {
      BodyDescriptor::Array(items) => items,
      _ => unreachable!("only array bodies should be passed to the BodyArrayVisitor"),
    };

    trail_values.was_empty_array = items.unique_items_count() == 0;
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
    let trail_values = self.get_or_insert(json_trail);

    if let BodyDescriptor::Object(object_description) = &body {
      trail_values.was_object = true;

      let keys = object_description.keys().map(|x| (*x).clone());
      let keys_set = HashSet::<String>::from_iter(keys);

      trail_values.insert_field_set(keys_set);
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
