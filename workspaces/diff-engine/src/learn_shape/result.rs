use crate::commands::SpecCommand;
use crate::shapes::JsonTrail;
use crate::state::shape::ShapeKindDescriptor;
use crate::BodyDescriptor;
use std::collections::{HashMap, HashSet};

#[derive(Clone, Debug, Default)]
pub struct TrailObservationsResult {
  values_by_trail: HashMap<JsonTrail, TrailValues>,
}

impl TrailObservationsResult {
  pub fn union(&mut self, new_result: TrailObservationsResult) {
    for (json_trail, new_trail_values) in new_result.values_by_trail {
      let existing_trail_values = self
        .values_by_trail
        .entry(json_trail)
        .or_insert_with_key(|json_trail| TrailValues::new(json_trail));

      existing_trail_values.union(new_trail_values);
    }
  }

  pub fn into_commands(self) -> impl Iterator<Item = SpecCommand> {
    todo!("create shape prototype for each trail and use them to generate commands");

    std::iter::empty()
  }
}

impl From<HashMap<JsonTrail, TrailValues>> for TrailObservationsResult {
  fn from(values_by_trail: HashMap<JsonTrail, TrailValues>) -> Self {
    Self { values_by_trail }
  }
}

pub type FieldSet = HashSet<String>;

#[derive(Clone, Debug)]
pub struct TrailValues {
  trail: JsonTrail,
  pub was_string: bool,
  pub was_number: bool,
  pub was_boolean: bool,
  pub was_null: bool,
  pub was_array: bool,
  pub was_object: bool,
  field_set: HashSet<FieldSet>,
}

impl TrailValues {
  pub fn new(json_trail: &JsonTrail) -> Self {
    Self {
      trail: json_trail.clone(),
      was_string: false,
      was_number: false,
      was_boolean: false,
      was_null: false,
      was_array: false,
      was_object: false,
      field_set: Default::default(),
    }
  }

  pub fn union(&mut self, new_values: TrailValues) {
    self.was_string = self.was_string || new_values.was_string;
    self.was_number = self.was_number || new_values.was_number;
    self.was_boolean = self.was_boolean || new_values.was_boolean;
    self.was_null = self.was_null || new_values.was_null;
    self.was_array = self.was_array || new_values.was_array;
    self.was_object = self.was_object || new_values.was_object;
    // TODO: figure out what to do about field sets
  }

  fn into_shape_prototype(self, id: String) -> ShapePrototype {
    todo!()
  }
}

struct ShapePrototype {
  id: String,
  trail: JsonTrail,
  prototype_descriptor: ShapePrototypeDescriptor,
}

enum ShapePrototypeDescriptor {
  OptionalShape {
    shape: Box<ShapePrototype>,
  },
  NullableShape {
    shape: Box<ShapePrototype>,
  },
  OneOfShape {
    branches: Vec<ShapePrototype>,
  },
  ObjectWithFields {
    fields: Vec<ShapePrototype>,
  },
  ListOfShape {
    shape: Box<ShapePrototype>,
  },
  FieldWithShape {
    key: String,
    shape: Box<ShapePrototype>,
  },
  PrimitiveKind {
    base_shape_kind: ShapeKindDescriptor,
  },
  Unknown {},
}
