use crate::shapes::JsonTrail;
use std::collections::{HashSet, HashMap};
use crate::HttpInteraction;

mod trail_values;
mod visitors;
mod json_traverser;

struct TrailValues {
  trail: JsonTrail,
  was_string: bool,
  was_number: bool,
  was_boolean: bool,
  was_null: bool,
  was_array: bool,
  was_object: bool,
  field_set: HashSet<HashSet<String>>
}
