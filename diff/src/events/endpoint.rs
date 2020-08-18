use super::EventContext;
use cqrs_core::Event;
use serde::Deserialize;

use crate::state::endpoint::{
  PathComponentId, RequestId, RequestParameterId, ResponseId, ShapedBodyDescriptor,
  ShapedRequestParameterShapeDescriptor,
};

#[derive(Deserialize)]
pub enum EndpointEvent {
  // path components
  PathComponentAdded(PathComponentAdded),
  PathComponentRenamed(PathComponentRenamed),
  PathComponentRemoved(PathComponentRemoved),

  // path parameters
  PathParameterAdded(PathParameterAdded),
  PathParameterShapeSet(PathParameterShapeSet),
  PathParameterRenamed(PathParameterRenamed),
  PathParameterRemoved(PathParameterRemoved),

  // request parameters
  RequestParameterAddedByPathAndMethod(RequestParameterAddedByPathAndMethod),
  RequestParameterRenamed(RequestParameterRenamed),
  RequestParameterShapeSet(RequestParameterShapeSet),
  RequestParameterShapeUnset(RequestParameterShapeUnset),
  RequestParameterRemoved(RequestParameterRemoved),

  // Request events
  RequestAdded(RequestAdded),
  RequestContentTypeSet(RequestContentTypeSet),
  RequestBodySet(RequestBodySet),
  RequestBodyUnset(RequestBodyUnset),

  // Response events
  ResponseAddedByPathAndMethod(ResponseAddedByPathAndMethod),
  ResponseStatusCodeSet(ResponseStatusCodeSet),
  ResponseContentTypeSet(ResponseContentTypeSet),
  ResponseBodySet(ResponseBodySet),
  ResponseBodyUnset(ResponseBodyUnset),
  ResponseRemoved(ResponseRemoved),
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathComponentAdded {
  pub path_id: PathComponentId,
  pub parent_path_id: PathComponentId,
  pub name: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathComponentRenamed {
  path_id: PathComponentId,
  name: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathComponentRemoved {
  path_id: PathComponentId,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathParameterAdded {
  path_id: PathComponentId,
  parent_path_id: PathComponentId,
  name: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathParameterRenamed {
  path_id: PathComponentId,
  name: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathParameterRemoved {
  path_id: PathComponentId,
  name: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PathParameterShapeSet {
  path_id: PathComponentId,
  shape_descriptor: ShapedRequestParameterShapeDescriptor,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)] // request parameters
#[serde(rename_all = "camelCase")]
pub struct RequestParameterAddedByPathAndMethod {
  pub parameter_id: RequestParameterId,
  pub path_id: PathComponentId,
  pub http_method: String,
  pub parameter_location: String,
  pub name: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestParameterRenamed {
  parameter_id: RequestParameterId,
  name: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestParameterShapeSet {
  pub parameter_id: RequestParameterId,
  pub parameter_descriptor: ShapedRequestParameterShapeDescriptor,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestParameterShapeUnset {
  parameter_id: RequestParameterId,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestParameterRemoved {
  parameter_id: RequestParameterId,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)] // Request events
#[serde(rename_all = "camelCase")]
pub struct RequestAdded {
  pub request_id: RequestId,
  pub path_id: PathComponentId,
  pub http_method: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestContentTypeSet {
  request_id: RequestId,
  http_content_type: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestBodySet {
  request_id: RequestId,
  // bodyDescriptor: ShapedBodyDescriptor,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestBodyUnset {
  request_id: RequestId,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestRemoved {
  request_id: RequestId,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)] // Response events
#[serde(rename_all = "camelCase")]
pub struct ResponseAddedByPathAndMethod {
  pub response_id: ResponseId,
  pub path_id: PathComponentId,
  pub http_method: String,
  pub http_status_code: u16,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseStatusCodeSet {
  response_id: ResponseId,
  http_status_code: u16,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseContentTypeSet {
  response_id: ResponseId,
  http_content_type: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseBodySet {
  pub response_id: ResponseId,
  pub body_descriptor: ShapedBodyDescriptor,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseBodyUnset {
  response_id: ResponseId,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResponseRemoved {
  response_id: ResponseId,
  event_context: Option<EventContext>,
}

impl Event for EndpointEvent {
  fn event_type(&self) -> &'static str {
    match self {
      EndpointEvent::PathComponentAdded(evt) => evt.event_type(),
      EndpointEvent::PathComponentRenamed(evt) => evt.event_type(),
      EndpointEvent::PathComponentRemoved(evt) => evt.event_type(),

      // path parameters
      EndpointEvent::PathParameterAdded(evt) => evt.event_type(),
      EndpointEvent::PathParameterShapeSet(evt) => evt.event_type(),
      EndpointEvent::PathParameterRenamed(evt) => evt.event_type(),
      EndpointEvent::PathParameterRemoved(evt) => evt.event_type(),

      // request parameters
      EndpointEvent::RequestParameterAddedByPathAndMethod(evt) => evt.event_type(),
      EndpointEvent::RequestParameterRenamed(evt) => evt.event_type(),
      EndpointEvent::RequestParameterShapeSet(evt) => evt.event_type(),
      EndpointEvent::RequestParameterShapeUnset(evt) => evt.event_type(),
      EndpointEvent::RequestParameterRemoved(evt) => evt.event_type(),

      // Request events
      EndpointEvent::RequestAdded(evt) => evt.event_type(),
      EndpointEvent::RequestContentTypeSet(evt) => evt.event_type(),
      EndpointEvent::RequestBodySet(evt) => evt.event_type(),
      EndpointEvent::RequestBodyUnset(evt) => evt.event_type(),

      // Response events
      EndpointEvent::ResponseAddedByPathAndMethod(evt) => evt.event_type(),
      EndpointEvent::ResponseStatusCodeSet(evt) => evt.event_type(),
      EndpointEvent::ResponseContentTypeSet(evt) => evt.event_type(),
      EndpointEvent::ResponseBodySet(evt) => evt.event_type(),
      EndpointEvent::ResponseBodyUnset(evt) => evt.event_type(),
      EndpointEvent::ResponseRemoved(evt) => evt.event_type(),
    }
  }
}

impl Event for PathComponentAdded {
  fn event_type(&self) -> &'static str {
    "PathComponentAdded"
  }
}

impl Event for PathParameterShapeSet {
  fn event_type(&self) -> &'static str {
    "PathParameterShapeSet"
  }
}

impl Event for PathComponentRenamed {
  fn event_type(&self) -> &'static str {
    "PathComponentRenamed"
  }
}

impl Event for PathComponentRemoved {
  fn event_type(&self) -> &'static str {
    "PathComponentRemoved"
  }
}

impl Event for PathParameterAdded {
  fn event_type(&self) -> &'static str {
    "PathParameterAdded"
  }
}

impl Event for PathParameterRenamed {
  fn event_type(&self) -> &'static str {
    "PathParameterRenamed"
  }
}

impl Event for PathParameterRemoved {
  fn event_type(&self) -> &'static str {
    "PathParameterRemoved"
  }
}

impl Event for RequestParameterAddedByPathAndMethod {
  fn event_type(&self) -> &'static str {
    "RequestParameterAddedByPathAndMethod"
  }
}

impl Event for RequestParameterRenamed {
  fn event_type(&self) -> &'static str {
    "RequestParameterRenamed"
  }
}

impl Event for RequestParameterShapeSet {
  fn event_type(&self) -> &'static str {
    "RequestParameterShapeSet"
  }
}

impl Event for RequestParameterShapeUnset {
  fn event_type(&self) -> &'static str {
    "RequestParameterShapeUnset"
  }
}

impl Event for RequestParameterRemoved {
  fn event_type(&self) -> &'static str {
    "RequestParameterRemoved"
  }
}

impl Event for RequestAdded {
  fn event_type(&self) -> &'static str {
    "RequestAdded"
  }
}

impl Event for RequestContentTypeSet {
  fn event_type(&self) -> &'static str {
    "RequestContentTypeSet"
  }
}

impl Event for RequestBodySet {
  fn event_type(&self) -> &'static str {
    "RequestBodySet"
  }
}

impl Event for RequestBodyUnset {
  fn event_type(&self) -> &'static str {
    "RequestBodyUnset"
  }
}

impl Event for RequestRemoved {
  fn event_type(&self) -> &'static str {
    "RequestRemoved"
  }
}

impl Event for ResponseAddedByPathAndMethod {
  fn event_type(&self) -> &'static str {
    "ResponseAddedByPathAndMethod"
  }
}

impl Event for ResponseStatusCodeSet {
  fn event_type(&self) -> &'static str {
    "ResponseStatusCodeSet"
  }
}

impl Event for ResponseContentTypeSet {
  fn event_type(&self) -> &'static str {
    "ResponseContentTypeSet"
  }
}

impl Event for ResponseBodySet {
  fn event_type(&self) -> &'static str {
    "ResponseBodySet"
  }
}

impl Event for ResponseBodyUnset {
  fn event_type(&self) -> &'static str {
    "ResponseBodyUnset"
  }
}

impl Event for ResponseRemoved {
  fn event_type(&self) -> &'static str {
    "ResponseRemoved"
  }
}
