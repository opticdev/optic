use super::shape::ShapeId;
use serde::Deserialize;

pub type PathComponentId = String;
pub type PathComponentIdRef<'a> = &'a str;
pub type RequestId = String;
pub type RequestParameterId = String;
pub type ResponseId = String;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShapedBodyDescriptor {
  http_content_type: String,
  shape_id: ShapeId,
  is_removed: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ShapedRequestParameterShapeDescriptor {
  shape_id: ShapeId,
  is_removed: bool,
}
