use crate::shapes::{JsonTrail, ShapeTrail};
use serde::Serialize;

#[derive(Serialize)]
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
