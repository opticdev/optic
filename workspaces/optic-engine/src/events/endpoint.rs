use super::{EventContext, WithEventContext};
use cqrs_core::Event;
use endpoint_commands::RemovePathParameter;
use serde::{Deserialize, Serialize};

use crate::commands::endpoint as endpoint_commands;
use crate::commands::EndpointCommand;
use crate::state::endpoint::{
  PathComponentId, QueryParametersId, QueryParametersShapeDescriptor, RequestId,
  RequestParameterId, ResponseId, ShapedBodyDescriptor, ShapedRequestParameterShapeDescriptor,
};

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
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

  // query parameteres
  QueryParametersAdded(QueryParametersAdded),
  QueryParametersShapeSet(QueryParametersShapeSet),
  QueryParametersRemoved(QueryParametersRemoved),

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
  RequestRemoved(RequestRemoved),

  // Response events
  ResponseAddedByPathAndMethod(ResponseAddedByPathAndMethod),
  ResponseStatusCodeSet(ResponseStatusCodeSet),
  ResponseContentTypeSet(ResponseContentTypeSet),
  ResponseBodySet(ResponseBodySet),
  ResponseBodyUnset(ResponseBodyUnset),
  ResponseRemoved(ResponseRemoved),
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PathComponentAdded {
  pub path_id: PathComponentId,
  pub parent_path_id: PathComponentId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PathComponentRenamed {
  pub path_id: PathComponentId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PathComponentRemoved {
  pub path_id: PathComponentId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PathParameterAdded {
  pub path_id: PathComponentId,
  pub parent_path_id: PathComponentId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PathParameterRenamed {
  pub path_id: PathComponentId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PathParameterRemoved {
  pub path_id: PathComponentId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PathParameterShapeSet {
  pub path_id: PathComponentId,
  pub shape_descriptor: ShapedRequestParameterShapeDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct QueryParametersAdded {
  pub query_parameters_id: QueryParametersId,
  pub http_method: String,
  pub path_id: PathComponentId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct QueryParametersShapeSet {
  pub query_parameters_id: QueryParametersId,
  pub shape_descriptor: QueryParametersShapeDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct QueryParametersRemoved {
  pub query_parameters_id: QueryParametersId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)] // request parameters
#[serde(rename_all = "camelCase")]
pub struct RequestParameterAddedByPathAndMethod {
  pub parameter_id: RequestParameterId,
  pub path_id: PathComponentId,
  pub http_method: String,
  pub parameter_location: String,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestParameterRenamed {
  pub parameter_id: RequestParameterId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestParameterShapeSet {
  pub parameter_id: RequestParameterId,
  pub parameter_descriptor: ShapedRequestParameterShapeDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestParameterShapeUnset {
  pub parameter_id: RequestParameterId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestParameterRemoved {
  pub parameter_id: RequestParameterId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)] // Request events
#[serde(rename_all = "camelCase")]
pub struct RequestAdded {
  pub request_id: RequestId,
  pub path_id: PathComponentId,
  pub http_method: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestContentTypeSet {
  pub request_id: RequestId,
  pub http_content_type: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestBodySet {
  pub request_id: RequestId,
  pub body_descriptor: ShapedBodyDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestBodyUnset {
  pub request_id: RequestId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RequestRemoved {
  pub request_id: RequestId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)] // Response events
#[serde(rename_all = "camelCase")]
pub struct ResponseAddedByPathAndMethod {
  pub response_id: ResponseId,
  pub path_id: PathComponentId,
  pub http_method: String,
  pub http_status_code: u16,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ResponseStatusCodeSet {
  pub response_id: ResponseId,
  pub http_status_code: u16,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ResponseContentTypeSet {
  pub response_id: ResponseId,
  pub http_content_type: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ResponseBodySet {
  pub response_id: ResponseId,
  pub body_descriptor: ShapedBodyDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ResponseBodyUnset {
  pub response_id: ResponseId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ResponseRemoved {
  pub response_id: ResponseId,
  pub event_context: Option<EventContext>,
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

      // query parameters
      EndpointEvent::QueryParametersAdded(evt) => evt.event_type(),
      EndpointEvent::QueryParametersShapeSet(evt) => evt.event_type(),
      EndpointEvent::QueryParametersRemoved(evt) => evt.event_type(),

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
      EndpointEvent::RequestRemoved(evt) => evt.event_type(),

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

impl WithEventContext for EndpointEvent {
  fn with_event_context(&mut self, event_context: EventContext) {
    match self {
      EndpointEvent::PathComponentAdded(evt) => evt.event_context.replace(event_context),
      EndpointEvent::PathComponentRenamed(evt) => evt.event_context.replace(event_context),
      EndpointEvent::PathComponentRemoved(evt) => evt.event_context.replace(event_context),

      // path parameters
      EndpointEvent::PathParameterAdded(evt) => evt.event_context.replace(event_context),
      EndpointEvent::PathParameterShapeSet(evt) => evt.event_context.replace(event_context),
      EndpointEvent::PathParameterRenamed(evt) => evt.event_context.replace(event_context),
      EndpointEvent::PathParameterRemoved(evt) => evt.event_context.replace(event_context),

      // query parameters
      EndpointEvent::QueryParametersAdded(evt) => evt.event_context.replace(event_context),
      EndpointEvent::QueryParametersShapeSet(evt) => evt.event_context.replace(event_context),
      EndpointEvent::QueryParametersRemoved(evt) => evt.event_context.replace(event_context),

      // request parameters
      EndpointEvent::RequestParameterAddedByPathAndMethod(evt) => {
        evt.event_context.replace(event_context)
      }
      EndpointEvent::RequestParameterRenamed(evt) => evt.event_context.replace(event_context),
      EndpointEvent::RequestParameterShapeSet(evt) => evt.event_context.replace(event_context),
      EndpointEvent::RequestParameterShapeUnset(evt) => evt.event_context.replace(event_context),
      EndpointEvent::RequestParameterRemoved(evt) => evt.event_context.replace(event_context),

      // Request events
      EndpointEvent::RequestAdded(evt) => evt.event_context.replace(event_context),
      EndpointEvent::RequestContentTypeSet(evt) => evt.event_context.replace(event_context),
      EndpointEvent::RequestBodySet(evt) => evt.event_context.replace(event_context),
      EndpointEvent::RequestBodyUnset(evt) => evt.event_context.replace(event_context),
      EndpointEvent::RequestRemoved(evt) => evt.event_context.replace(event_context),

      // Response events
      EndpointEvent::ResponseAddedByPathAndMethod(evt) => evt.event_context.replace(event_context),
      EndpointEvent::ResponseStatusCodeSet(evt) => evt.event_context.replace(event_context),
      EndpointEvent::ResponseContentTypeSet(evt) => evt.event_context.replace(event_context),
      EndpointEvent::ResponseBodySet(evt) => evt.event_context.replace(event_context),
      EndpointEvent::ResponseBodyUnset(evt) => evt.event_context.replace(event_context),
      EndpointEvent::ResponseRemoved(evt) => evt.event_context.replace(event_context),
    };
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

impl Event for QueryParametersAdded {
  fn event_type(&self) -> &'static str {
    "QueryParametersAdded"
  }
}

impl Event for QueryParametersShapeSet {
  fn event_type(&self) -> &'static str {
    "QueryParametersShapeSet"
  }
}

impl Event for QueryParametersRemoved {
  fn event_type(&self) -> &'static str {
    "QueryParametersRemoved"
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

impl From<PathComponentAdded> for EndpointEvent {
  fn from(event: PathComponentAdded) -> Self {
    Self::PathComponentAdded(event)
  }
}

impl From<PathComponentRenamed> for EndpointEvent {
  fn from(event: PathComponentRenamed) -> Self {
    Self::PathComponentRenamed(event)
  }
}

impl From<PathComponentRemoved> for EndpointEvent {
  fn from(event: PathComponentRemoved) -> Self {
    Self::PathComponentRemoved(event)
  }
}

impl From<PathParameterAdded> for EndpointEvent {
  fn from(event: PathParameterAdded) -> Self {
    Self::PathParameterAdded(event)
  }
}

impl From<PathParameterShapeSet> for EndpointEvent {
  fn from(event: PathParameterShapeSet) -> Self {
    Self::PathParameterShapeSet(event)
  }
}

impl From<PathParameterRenamed> for EndpointEvent {
  fn from(event: PathParameterRenamed) -> Self {
    Self::PathParameterRenamed(event)
  }
}

impl From<PathParameterRemoved> for EndpointEvent {
  fn from(event: PathParameterRemoved) -> Self {
    Self::PathParameterRemoved(event)
  }
}

impl From<QueryParametersAdded> for EndpointEvent {
  fn from(event: QueryParametersAdded) -> Self {
    Self::QueryParametersAdded(event)
  }
}

impl From<QueryParametersShapeSet> for EndpointEvent {
  fn from(event: QueryParametersShapeSet) -> Self {
    Self::QueryParametersShapeSet(event)
  }
}

impl From<QueryParametersRemoved> for EndpointEvent {
  fn from(event: QueryParametersRemoved) -> Self {
    Self::QueryParametersRemoved(event)
  }
}

impl From<RequestAdded> for EndpointEvent {
  fn from(event: RequestAdded) -> Self {
    Self::RequestAdded(event)
  }
}

impl From<RequestBodySet> for EndpointEvent {
  fn from(event: RequestBodySet) -> Self {
    Self::RequestBodySet(event)
  }
}

impl From<RequestRemoved> for EndpointEvent {
  fn from(event: RequestRemoved) -> Self {
    Self::RequestRemoved(event)
  }
}

impl From<ResponseAddedByPathAndMethod> for EndpointEvent {
  fn from(event: ResponseAddedByPathAndMethod) -> Self {
    Self::ResponseAddedByPathAndMethod(event)
  }
}

impl From<ResponseBodySet> for EndpointEvent {
  fn from(event: ResponseBodySet) -> Self {
    Self::ResponseBodySet(event)
  }
}

impl From<ResponseRemoved> for EndpointEvent {
  fn from(event: ResponseRemoved) -> Self {
    Self::ResponseRemoved(event)
  }
}

// Conversion from commands
// ------------------------

impl From<EndpointCommand> for EndpointEvent {
  fn from(endpoint_command: EndpointCommand) -> Self {
    match endpoint_command {
      EndpointCommand::AddPathComponent(command) => {
        EndpointEvent::from(PathComponentAdded::from(command))
      }
      EndpointCommand::RenamePathComponent(command) => {
        EndpointEvent::from(PathComponentRenamed::from(command))
      }
      EndpointCommand::RemovePathComponent(command) => {
        EndpointEvent::from(PathComponentRemoved::from(command))
      }
      EndpointCommand::AddPathParameter(command) => {
        EndpointEvent::from(PathParameterAdded::from(command))
      }
      EndpointCommand::SetPathParameterShape(command) => {
        EndpointEvent::from(PathParameterShapeSet::from(command))
      }
      EndpointCommand::RenamePathParameter(command) => {
        EndpointEvent::from(PathParameterRenamed::from(command))
      }
      EndpointCommand::RemovePathParameter(command) => {
        EndpointEvent::from(PathParameterRemoved::from(command))
      }
      EndpointCommand::AddQueryParameters(command) => {
        EndpointEvent::from(QueryParametersAdded::from(command))
      }
      EndpointCommand::SetQueryParametersShape(command) => {
        EndpointEvent::from(QueryParametersShapeSet::from(command))
      }
      EndpointCommand::RemoveQueryParameters(command) => {
        EndpointEvent::from(QueryParametersRemoved::from(command))
      }
      EndpointCommand::AddRequest(command) => EndpointEvent::from(RequestAdded::from(command)),
      EndpointCommand::SetRequestBodyShape(command) => {
        EndpointEvent::from(RequestBodySet::from(command))
      }
      EndpointCommand::RemoveRequest(command) => EndpointEvent::from(RequestRemoved::from(command)),
      EndpointCommand::AddResponseByPathAndMethod(command) => {
        EndpointEvent::from(ResponseAddedByPathAndMethod::from(command))
      }
      EndpointCommand::SetResponseBodyShape(command) => {
        EndpointEvent::from(ResponseBodySet::from(command))
      }
      EndpointCommand::RemoveResponse(command) => {
        EndpointEvent::from(ResponseRemoved::from(command))
      }
      _ => unimplemented!(
        "conversion from endpoint command to endpoint event not implemented for variant: {:?}",
        endpoint_command
      ),
    }
  }
}

impl From<endpoint_commands::AddPathComponent> for PathComponentAdded {
  fn from(command: endpoint_commands::AddPathComponent) -> Self {
    Self {
      path_id: command.path_id,
      parent_path_id: command.parent_path_id,
      name: command.name,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::RenamePathComponent> for PathComponentRenamed {
  fn from(command: endpoint_commands::RenamePathComponent) -> Self {
    Self {
      path_id: command.path_id,
      name: command.name,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::RemovePathComponent> for PathComponentRemoved {
  fn from(command: endpoint_commands::RemovePathComponent) -> Self {
    Self {
      path_id: command.path_id,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::AddPathParameter> for PathParameterAdded {
  fn from(command: endpoint_commands::AddPathParameter) -> Self {
    Self {
      path_id: command.path_id,
      parent_path_id: command.parent_path_id,
      name: command.name,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::SetPathParameterShape> for PathParameterShapeSet {
  fn from(command: endpoint_commands::SetPathParameterShape) -> Self {
    Self {
      path_id: command.path_id,
      shape_descriptor: command.shaped_request_parameter_shape_descriptor,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::RenamePathParameter> for PathParameterRenamed {
  fn from(command: endpoint_commands::RenamePathParameter) -> Self {
    Self {
      path_id: command.path_id,
      name: command.name,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::RemovePathParameter> for PathParameterRemoved {
  fn from(command: endpoint_commands::RemovePathParameter) -> Self {
    Self {
      path_id: command.path_id,
      name: String::from(""), // TODO verify if this is okay, since command has no name
      event_context: None,
    }
  }
}

impl From<endpoint_commands::AddQueryParameters> for QueryParametersAdded {
  fn from(command: endpoint_commands::AddQueryParameters) -> Self {
    Self {
      http_method: command.http_method,
      path_id: command.path_id,
      query_parameters_id: command.query_parameters_id,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::SetQueryParametersShape> for QueryParametersShapeSet {
  fn from(command: endpoint_commands::SetQueryParametersShape) -> Self {
    Self {
      query_parameters_id: command.query_parameters_id,
      shape_descriptor: command.shape_descriptor,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::RemoveQueryParameters> for QueryParametersRemoved {
  fn from(command: endpoint_commands::RemoveQueryParameters) -> Self {
    Self {
      query_parameters_id: command.query_parameters_id,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::AddRequest> for RequestAdded {
  fn from(command: endpoint_commands::AddRequest) -> Self {
    Self {
      http_method: command.http_method,
      path_id: command.path_id,
      request_id: command.request_id,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::SetRequestBodyShape> for RequestBodySet {
  fn from(command: endpoint_commands::SetRequestBodyShape) -> Self {
    Self {
      request_id: command.request_id,
      body_descriptor: command.body_descriptor,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::RemoveRequest> for RequestRemoved {
  fn from(command: endpoint_commands::RemoveRequest) -> Self {
    Self {
      request_id: command.request_id,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::AddResponseByPathAndMethod> for ResponseAddedByPathAndMethod {
  fn from(command: endpoint_commands::AddResponseByPathAndMethod) -> Self {
    Self {
      http_method: command.http_method,
      http_status_code: command.http_status_code,
      path_id: command.path_id,
      response_id: command.response_id,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::SetResponseBodyShape> for ResponseBodySet {
  fn from(command: endpoint_commands::SetResponseBodyShape) -> Self {
    Self {
      response_id: command.response_id,
      body_descriptor: command.body_descriptor,
      event_context: None,
    }
  }
}

impl From<endpoint_commands::RemoveResponse> for ResponseRemoved {
  fn from(command: endpoint_commands::RemoveResponse) -> Self {
    Self {
      response_id: command.response_id,
      event_context: None,
    }
  }
}
