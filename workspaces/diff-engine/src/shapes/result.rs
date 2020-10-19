use crate::shapes::{JsonTrail, ShapeTrail};
use serde::Serialize;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

#[derive(Debug, Serialize, Hash)]
pub enum ShapeDiffResult {
  #[serde(rename_all = "camelCase")]
  UnspecifiedShape {
    json_trail: JsonTrail,
    shape_trail: ShapeTrail,
  },
  #[serde(rename_all = "camelCase")]
  UnmatchedShape {
    json_trail: JsonTrail,
    shape_trail: ShapeTrail,
  },
}

impl ShapeDiffResult {
  pub fn fingerprint(&self) -> String {
    let mut hash_state = DefaultHasher::new();
    Hash::hash(self, &mut hash_state);
    format!("{:x}", hash_state.finish())
  }
}
