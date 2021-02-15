use serde::Deserialize;

use crate::state::endpoint::{
  PathComponentId, RequestId, RequestParameterId, ResponseId, ShapedBodyDescriptor,
  ShapedRequestParameterShapeDescriptor,
};

#[derive(Deserialize, Debug)]
pub enum EndpointCommand {
  // Path components
  AddPathComponent(AddPathComponent),
  RenamePathComponent(RenamePathComponent),
  RemovePathComponent(RemovePathComponent),

  // Path parameters
  AddPathParameter(AddPathParameter),
  SetPathParameterShape(SetPathParameterShape),
  RenamePathParameter(RenamePathParameter),
  RemovePathParameter(RemovePathParameter),

  // Requests
  AddRequest(AddRequest),
  SetRequestContentType(SetRequestContentType),
  SetRequestBodyShape(SetRequestBodyShape),
  UnsetRequestBodyShape(UnsetRequestBodyShape),
  RemoveRequest(RemoveRequest),

  // Responses
  AddResponse(AddResponse),
  AddResponseByPathAndMethod(AddResponseByPathAndMethod),
  SetResponseContentType(SetResponseContentType),
  SetResponseStatusCode(SetResponseStatusCode),
  SetResponseBodyShape(SetResponseBodyShape),
  UnsetResponseBodyShape(UnsetResponseBodyShape),
  RemoveResponse(RemoveResponse),

  // Headers
  AddHeaderParameter(AddHeaderParameter),
  SetHeaderParameterShape(SetHeaderParameterShape),
  RenameHeaderParameter(RenameHeaderParameter),
  UnsetHeaderParameterShape(UnsetHeaderParameterShape),
  RemoveHeaderParameter(RemoveHeaderParameter),
}

// Path components
// ---------------

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AddPathComponent {
  pub path_id: PathComponentId,
  pub parent_path_id: PathComponentId,
  pub name: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RenamePathComponent {
  path_id: PathComponentId,
  name: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RemovePathComponent {
  path_id: PathComponentId,
}

// Path parameters
// ---------------

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AddPathParameter {
  path_id: PathComponentId,
  parent_path_id: PathComponentId,
  name: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SetPathParameterShape {
  path_id: PathComponentId,
  shaped_request_parameter_shape_descriptor: ShapedRequestParameterShapeDescriptor,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RenamePathParameter {
  path_id: PathComponentId,
  name: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RemovePathParameter {
  path_id: PathComponentId,
}

// Requests
// --------

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AddRequest {
  request_id: RequestId,
  path_id: PathComponentId,
  http_method: String,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command's ability to change the content type anymore, or enforce uniqueness of content types across multiple requests
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SetRequestContentType {
  request_id: RequestId,
  http_content_type: String,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command's ability to change the content type anymore, or enforce uniqueness of content types across multiple requests
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SetRequestBodyShape {
  request_id: RequestId,
  body_descriptor: ShapedBodyDescriptor,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command anymore, or enforce uniqueness of content types across multiple requests
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UnsetRequestBodyShape {
  request_id: RequestId,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RemoveRequest {
  request_id: RequestId,
}

// Responses
// ---------

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AddResponse {
  response_id: ResponseId,
  request_id: RequestId,
  http_status_code: u16,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AddResponseByPathAndMethod {
  response_id: ResponseId,
  path_id: PathComponentId,
  http_method: String,
  http_status_code: u16,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command anymore, or enforce uniqueness of content types across multiple requests
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SetResponseContentType {
  response_id: ResponseId,
  http_content_type: String,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command anymore
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SetResponseStatusCode {
  response_id: ResponseId,
  http_status_code: u16,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command's ability to change the content type anymore, or enforce uniqueness of content types across multiple responses
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SetResponseBodyShape {
  response_id: ResponseId,
  body_descriptor: ShapedBodyDescriptor,
}

//@GOTCHA @TODO we should probably not support this command anymore, or enforce uniqueness of content types across multiple responses
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UnsetResponseBodyShape {
  response_id: ResponseId,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RemoveResponse {
  response_id: ResponseId,
}

// Headers
// -------

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AddHeaderParameter {
  parameter_id: RequestParameterId,
  request_id: RequestId,
  name: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SetHeaderParameterShape {
  parameter_id: RequestParameterId,
  parameter_descriptor: ShapedRequestParameterShapeDescriptor,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RenameHeaderParameter {
  parameter_id: RequestParameterId,
  name: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct UnsetHeaderParameterShape {
  parameter_id: RequestParameterId,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct RemoveHeaderParameter {
  parameter_id: RequestParameterId,
}
