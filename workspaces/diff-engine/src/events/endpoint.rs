use super::{EventContext, WithEventContext};
use cqrs_core::Event;
use endpoint_commands::RemovePathParameter;
use serde::{Deserialize, Serialize};

use crate::commands::endpoint as endpoint_commands;
use crate::commands::EndpointCommand;
use crate::state::endpoint::{
  PathComponentId, RequestId, RequestParameterId, ResponseId, ShapedBodyDescriptor,
  ShapedRequestParameterShapeDescriptor,
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

cqrs_event!(EndpointEvent {
  PathComponentAdded => "PathComponentAdded",
  PathComponentRenamed => "PathComponentRenamed",
  PathComponentRemoved => "PathComponentRemoved",

  PathParameterAdded => "PathParameterAdded",
  PathParameterRenamed => "PathParameterRenamed",
  PathParameterRemoved => "PathParameterRemoved",
  PathParameterShapeSet => "PathParameterShapeSet",

  RequestParameterAddedByPathAndMethod => "RequestParameterAddedByPathAndMethod",
  RequestParameterRenamed => "RequestParameterRenamed",
  RequestParameterShapeSet => "RequestParameterShapeSet",
  RequestParameterShapeUnset => "RequestParameterShapeUnset",
  RequestParameterRemoved => "RequestParameterRemoved",

  // Request events
  RequestAdded => "RequestAdded",
  RequestContentTypeSet => "RequestContentTypeSet",
  RequestBodySet => "RequestBodySet",
  RequestBodyUnset => "RequestBodyUnset",

  // Response events
  ResponseAddedByPathAndMethod => "ResponseAddedByPathAndMethod",
  ResponseStatusCodeSet => "ResponseStatusCodeSet",
  ResponseContentTypeSet => "ResponseContentTypeSet",
  ResponseBodySet => "ResponseBodySet",
  ResponseBodyUnset => "ResponseBodyUnset",
  ResponseRemoved => "ResponseRemoved"
});

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
      EndpointCommand::AddRequest(command) => EndpointEvent::from(RequestAdded::from(command)),
      EndpointCommand::SetRequestBodyShape(command) => {
        EndpointEvent::from(RequestBodySet::from(command))
      }
      EndpointCommand::AddResponseByPathAndMethod(command) => {
        EndpointEvent::from(ResponseAddedByPathAndMethod::from(command))
      }
      EndpointCommand::SetResponseBodyShape(command) => {
        EndpointEvent::from(ResponseBodySet::from(command))
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
