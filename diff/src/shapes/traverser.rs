use super::visitors::JsonBodyVisitors;
use crate::queries::shape::{ChoiceOutput, ShapeQueries};
use crate::state::shape::{FieldId, ShapeId, ShapeKind, ShapeParameterId};
use serde::Serialize;
use serde_json::Value as JsonValue;

pub struct Traverser<'a> {
  shape_queries: &'a ShapeQueries<'a>,
}

impl<'a> Traverser<'a> {
  pub fn new(shape_queries: &'a ShapeQueries) -> Self {
    Traverser { shape_queries }
  }

  pub fn traverse_root_shape<R>(
    &self,
    json_body_option: Option<JsonValue>,
    shape_id: &ShapeId,
    visitors: &mut impl JsonBodyVisitors<R>,
  ) {
    let body_trail = JsonTrail::empty();
    let trail_origin = ShapeTrail::new(shape_id.clone());
    let choices: Vec<ChoiceOutput> = vec![];
    self.traverse(
      json_body_option,
      body_trail,
      trail_origin,
      choices,
      visitors,
    )
  }

  pub fn traverse<R>(
    &self,
    json_body_option: Option<JsonValue>,
    body_trail: JsonTrail,
    trail_origin: ShapeTrail,
    trail_choices: Vec<ChoiceOutput>,
    visitors: &mut impl JsonBodyVisitors<R>,
  ) {
    if let None = json_body_option {
      return;
    }

    let json_body = json_body_option.unwrap();

    match json_body {
      JsonValue::Array(value) => {}
      JsonValue::Object(value) => {}
      x => {}
    }
  }
}

#[derive(Serialize, Clone)]
pub enum ShapeTrailPathComponent {
  #[serde(rename_all = "camelCase")]
  ObjectTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  ObjectFieldTrail {
    field_id: FieldId,
    field_shape_id: ShapeId,
  },
  #[serde(rename_all = "camelCase")]
  ListTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  ListItemTrail {
    list_shape_id: ShapeId,
    item_shape_id: ShapeId,
  },
  #[serde(rename_all = "camelCase")]
  OneOfTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  OneOfItemTrail {
    one_of_id: ShapeId,
    parameter_id: ShapeParameterId,
    item_shape_id: ShapeId,
  },
  #[serde(rename_all = "camelCase")]
  OptionalTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  OptionalItemTrail {
    shape_id: ShapeId,
    inner_shape_id: ShapeId,
  },
  #[serde(rename_all = "camelCase")]
  NullableTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  NullableItemTrail {
    shape_id: ShapeId,
    inner_shape_id: ShapeId,
  },
  #[serde(rename_all = "camelCase")]
  UnknownTrail {},
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShapeTrail {
  pub root_shape_id: ShapeId,
  pub path: Vec<ShapeTrailPathComponent>,
}
impl ShapeTrail {
  fn new(root_shape_id: ShapeId) -> Self {
    ShapeTrail {
      root_shape_id,
      path: vec![],
    }
  }
}

#[derive(Serialize, Clone)]
pub enum JsonTrailPathComponent {
  #[serde(rename_all = "camelCase")]
  JsonObject {},
  #[serde(rename_all = "camelCase")]
  JsonArray {},
  #[serde(rename_all = "camelCase")]
  JsonObjectKey { key: String },
  #[serde(rename_all = "camelCase")]
  JsonArrayItem { index: u32 },
}

#[derive(Serialize, Clone)]
pub struct JsonTrail {
  path: Vec<JsonTrailPathComponent>,
}
impl JsonTrail {
  fn empty() -> Self {
    JsonTrail { path: vec![] }
  }
}
#[cfg(test)]
mod test {
  use super::*;

  #[test]
  fn traversing_with_no_paths() {}
}
