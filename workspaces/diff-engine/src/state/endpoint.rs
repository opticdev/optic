pub use super::shape::ShapeId;
use serde::{Deserialize, Serialize};

pub type PathComponentId = String;
pub type PathComponentIdRef<'a> = &'a str;
pub type RequestId = String;
pub type RequestParameterId = String;
pub type ResponseId = String;
pub type HttpMethod = String;
pub type HttpStatusCode = u16;
pub type HttpContentType = String;

#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapedBodyDescriptor {
  pub http_content_type: String,
  pub shape_id: ShapeId,
  pub is_removed: bool,
}

#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapedRequestParameterShapeDescriptor {
  pub shape_id: ShapeId,
  pub is_removed: bool,
}
