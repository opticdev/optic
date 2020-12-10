use crate::shapes::JsonTrail;
use crate::HttpInteraction;
use std::collections::{HashMap, HashSet};

pub(crate) mod trail_values;
mod traverser;
mod visitors;

pub type FieldSet = HashSet<String>;

#[derive(Debug)]
pub struct TrailValues {
  trail: JsonTrail,
  was_string: bool,
  was_number: bool,
  was_boolean: bool,
  was_null: bool,
  was_array: bool,
  was_object: bool,
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
      field_set: Default::default()
    }
  }
}
