use crate::shapes::JsonTrail;
use crate::HttpInteraction;
use std::collections::{HashMap, HashSet};

mod trail_values;
mod traverser;
mod visitors;

type FieldSet = HashSet<String>;

#[derive(Debug)]
struct TrailValues {
  trail: JsonTrail,
  was_string: bool,
  was_number: bool,
  was_boolean: bool,
  was_null: bool,
  was_array: bool,
  was_object: bool,
  field_set: HashSet<FieldSet>,
}
