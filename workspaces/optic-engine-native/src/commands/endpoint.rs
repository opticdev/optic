use super::{CommandContext, SpecCommand, SpecCommandError};
use serde::{Deserialize, Serialize};

use crate::events::EndpointEvent;
use crate::projections::endpoint::ROOT_PATH_ID;
use crate::projections::EndpointProjection;
use crate::state::endpoint::{
  PathComponentId, RequestId, RequestParameterId, ResponseId, ShapedBodyDescriptor,
  ShapedRequestParameterShapeDescriptor,
};
use crate::state::shape::ShapeId;
use crate::{events::endpoint as endpoint_events, state::body};
use cqrs_core::AggregateCommand;

#[derive(Deserialize, Debug, Clone, Serialize)]
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

impl EndpointCommand {
  pub fn set_path_parameter_shape(path_id: PathComponentId, shape_id: ShapeId) -> EndpointCommand {
    EndpointCommand::SetPathParameterShape(SetPathParameterShape {
      path_id,
      shaped_request_parameter_shape_descriptor: ShapedRequestParameterShapeDescriptor {
        shape_id,
        is_removed: false,
      },
    })
  }

  // Requests
  // --------

  pub fn add_request(
    request_id: RequestId,
    path_id: PathComponentId,
    http_method: String,
  ) -> EndpointCommand {
    EndpointCommand::AddRequest(AddRequest {
      request_id,
      path_id,
      http_method,
    })
  }

  pub fn set_request_body_shape(
    request_id: RequestId,
    shape_id: ShapeId,
    http_content_type: String,
    is_removed: bool,
  ) -> EndpointCommand {
    EndpointCommand::SetRequestBodyShape(SetRequestBodyShape {
      request_id,
      body_descriptor: ShapedBodyDescriptor {
        http_content_type,
        shape_id,
        is_removed,
      },
    })
  }

  // Responses
  // ---------

  pub fn add_response_by_path_and_method(
    response_id: ResponseId,
    path_id: PathComponentId,
    http_method: String,
    http_status_code: u16,
  ) -> EndpointCommand {
    EndpointCommand::AddResponseByPathAndMethod(AddResponseByPathAndMethod {
      response_id,
      path_id,
      http_method,
      http_status_code,
    })
  }

  pub fn set_response_body_shape(
    response_id: ResponseId,
    shape_id: ShapeId,
    http_content_type: String,
    is_removed: bool,
  ) -> EndpointCommand {
    EndpointCommand::SetResponseBodyShape(SetResponseBodyShape {
      response_id,
      body_descriptor: ShapedBodyDescriptor {
        http_content_type,
        shape_id,
        is_removed,
      },
    })
  }
}

// Path components
// ---------------

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddPathComponent {
  pub path_id: PathComponentId,
  pub parent_path_id: PathComponentId,
  pub name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RenamePathComponent {
  pub path_id: PathComponentId,
  pub name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemovePathComponent {
  pub path_id: PathComponentId,
}

// Path parameters
// ---------------

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddPathParameter {
  pub path_id: PathComponentId,
  pub parent_path_id: PathComponentId,
  pub name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetPathParameterShape {
  pub path_id: PathComponentId,
  pub shaped_request_parameter_shape_descriptor: ShapedRequestParameterShapeDescriptor,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RenamePathParameter {
  pub path_id: PathComponentId,
  pub name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemovePathParameter {
  pub path_id: PathComponentId,
}

// Requests
// --------

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddRequest {
  pub request_id: RequestId,
  pub path_id: PathComponentId,
  pub http_method: String,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command's ability to change the content type anymore, or enforce uniqueness of content types across multiple requests
#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetRequestContentType {
  request_id: RequestId,
  http_content_type: String,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command's ability to change the content type anymore, or enforce uniqueness of content types across multiple requests
#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetRequestBodyShape {
  pub request_id: RequestId,
  pub body_descriptor: ShapedBodyDescriptor,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command anymore, or enforce uniqueness of content types across multiple requests
#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UnsetRequestBodyShape {
  request_id: RequestId,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveRequest {
  request_id: RequestId,
}

// Responses
// ---------

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddResponse {
  response_id: ResponseId,
  request_id: RequestId,
  http_status_code: u16,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddResponseByPathAndMethod {
  pub response_id: ResponseId,
  pub path_id: PathComponentId,
  pub http_method: String,
  pub http_status_code: u16,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command anymore, or enforce uniqueness of content types across multiple requests
#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetResponseContentType {
  response_id: ResponseId,
  http_content_type: String,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command anymore
#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetResponseStatusCode {
  response_id: ResponseId,
  http_status_code: u16,
}

//@GOTCHA #leftovers-from-designer-ui @TODO we should probably not support this command's ability to change the content type anymore, or enforce uniqueness of content types across multiple responses
#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetResponseBodyShape {
  pub response_id: ResponseId,
  pub body_descriptor: ShapedBodyDescriptor,
}

//@GOTCHA @TODO we should probably not support this command anymore, or enforce uniqueness of content types across multiple responses
#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UnsetResponseBodyShape {
  response_id: ResponseId,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveResponse {
  response_id: ResponseId,
}

// Headers
// -------

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddHeaderParameter {
  parameter_id: RequestParameterId,
  request_id: RequestId,
  name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetHeaderParameterShape {
  parameter_id: RequestParameterId,
  parameter_descriptor: ShapedRequestParameterShapeDescriptor,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameHeaderParameter {
  parameter_id: RequestParameterId,
  name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UnsetHeaderParameterShape {
  parameter_id: RequestParameterId,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveHeaderParameter {
  parameter_id: RequestParameterId,
}

// Command handling
// ----------------

impl AggregateCommand<EndpointProjection> for EndpointCommand {
  type Error = SpecCommandError;
  type Event = EndpointEvent;
  type Events = Vec<EndpointEvent>;

  fn execute_on(self, projection: &EndpointProjection) -> Result<Self::Events, Self::Error> {
    let validation = CommandValidationQueries::from((projection, &self));

    let events = match self {
      // Path components
      // ---------------
      EndpointCommand::AddPathComponent(command) => {
        validation.require(
          validation.path_component_id_exists(&command.parent_path_id),
          "parent path component must exist to add path component",
        )?;
        validation.require(
          !validation.path_component_id_exists(&command.path_id),
          "path id must be assignable to add path component",
        )?;

        vec![EndpointEvent::from(
          endpoint_events::PathComponentAdded::from(command),
        )]
      }

      EndpointCommand::RenamePathComponent(command) => {
        validation.require(
          !validation.path_component_is_root(&command.path_id),
          "path id can not be root to rename path component",
        )?;

        validation.require(
          validation.path_component_id_exists(&command.path_id),
          "path component must exist to rename path component",
        )?;

        vec![EndpointEvent::from(
          endpoint_events::PathComponentRenamed::from(command),
        )]
      }

      EndpointCommand::RemovePathComponent(command) => {
        validation.require(
          !validation.path_component_is_root(&command.path_id),
          "path id must not be root to remove path component",
        )?;
        validation.require(
          validation.path_component_id_exists(&command.path_id),
          "path component must exist to remove path component",
        )?;

        vec![EndpointEvent::from(
          endpoint_events::PathComponentRemoved::from(command),
        )]
      }

      // Path parameters
      // ---------------
      EndpointCommand::AddPathParameter(command) => {
        validation.require(
          validation.path_component_id_exists(&command.parent_path_id),
          "parent path component must exist to add path parameter",
        )?;
        validation.require(
          !validation.path_component_id_exists(&command.path_id),
          "path id must be assignable to add path parameter",
        )?;

        vec![EndpointEvent::from(
          endpoint_events::PathParameterAdded::from(command),
        )]
      }

      EndpointCommand::SetPathParameterShape(command) => {
        validation.require(
          !validation.path_component_is_root(&command.path_id),
          "path id can not be root to set path parameter shape",
        )?;
        validation.require(
          validation.path_component_id_exists(&command.path_id),
          "path component must exist to set path parameter shape",
        )?;

        vec![EndpointEvent::from(
          endpoint_events::PathParameterShapeSet::from(command),
        )]
      }

      EndpointCommand::RenamePathParameter(command) => {
        validation.require(
          !validation.path_component_is_root(&command.path_id),
          "path id can not be root to rename path parameter",
        )?;
        validation.require(
          validation.path_component_id_exists(&command.path_id),
          "path component must exist to rename path parameter",
        )?;

        vec![EndpointEvent::from(
          endpoint_events::PathParameterRenamed::from(command),
        )]
      }

      EndpointCommand::RemovePathParameter(command) => {
        validation.require(
          !validation.path_component_is_root(&command.path_id),
          "path id must not be root to remove path parameter",
        )?;
        validation.require(
          validation.path_component_id_exists(&command.path_id),
          "path component must exist to remove path parameter",
        )?;

        vec![EndpointEvent::from(
          endpoint_events::PathParameterRemoved::from(command),
        )]
      }

      // Requests
      // --------
      EndpointCommand::AddRequest(command) => {
        validation.require(
          !validation.request_exists(&command.request_id),
          "request id must be assignable to add request",
        )?;
        validation.require(
          validation.path_component_id_exists(&command.path_id),
          "path component must exist to add request",
        )?;
        // TODO: consider validating request doesn't exist yet
        // TODO: consider whether we need to port query param events as well
        vec![EndpointEvent::from(endpoint_events::RequestAdded::from(
          command,
        ))]
      }

      EndpointCommand::SetRequestBodyShape(command) => {
        validation.require(
          validation.request_exists(&command.request_id),
          "request must exist to set request body shape",
        )?;

        vec![EndpointEvent::from(endpoint_events::RequestBodySet::from(
          command,
        ))]
      }

      // Responses
      // ---------
      EndpointCommand::AddResponseByPathAndMethod(command) => {
        validation.require(
          !validation.response_exists(&command.response_id),
          "response id must be assignable to add response by path and method",
        )?;
        validation.require(
          validation.path_component_id_exists(&command.path_id),
          "path component must exist to add response by path and method",
        )?;

        vec![EndpointEvent::from(
          endpoint_events::ResponseAddedByPathAndMethod::from(command),
        )]
      }

      EndpointCommand::SetResponseBodyShape(command) => {
        validation.require(
          validation.response_exists(&command.response_id),
          "response must exist to set response body shape",
        )?;

        vec![EndpointEvent::from(endpoint_events::ResponseBodySet::from(
          command,
        ))]
      }

      _ => Err(SpecCommandError::Unimplemented(
        "endpoint command not implemented for endpoint projection",
        SpecCommand::EndpointCommand(self),
      ))?,
    };

    Ok(events)
  }
}

struct CommandValidationQueries<'a> {
  command_description: String,
  endpoint_projection: &'a EndpointProjection,
}

impl<'a> CommandValidationQueries<'a> {
  fn require(&self, condition: bool, msg: &'static str) -> Result<(), SpecCommandError> {
    if condition {
      Ok(())
    } else {
      Err(SpecCommandError::Validation(format!(
        "Command failed validation: {}, {:?}",
        msg, self.command_description
      )))
    }
  }

  pub fn path_component_id_exists(&self, path_component_id: &PathComponentId) -> bool {
    self
      .endpoint_projection
      .get_path_component_node_index(path_component_id)
      .is_some()
  }

  pub fn path_component_is_root(&self, path_component_id: &PathComponentId) -> bool {
    path_component_id == ROOT_PATH_ID
  }

  pub fn request_exists(&self, request_id: &RequestId) -> bool {
    self
      .endpoint_projection
      .get_request_node_index(request_id)
      .is_some()
  }

  pub fn response_exists(&self, response_id: &ResponseId) -> bool {
    self
      .endpoint_projection
      .get_response_node_index(response_id)
      .is_some()
  }
}

impl<'a> From<(&'a EndpointProjection, &EndpointCommand)> for CommandValidationQueries<'a> {
  fn from(
    (endpoint_projection, endpoint_command): (&'a EndpointProjection, &EndpointCommand),
  ) -> Self {
    Self {
      command_description: format!("{:?}", endpoint_command),
      endpoint_projection,
    }
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use crate::events::SpecEvent;
  use cqrs_core::Aggregate;
  use insta::assert_debug_snapshot;
  use serde_json::json;

  #[test]
  pub fn can_handle_add_path_component_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = EndpointProjection::from(initial_events);

    let command: EndpointCommand = serde_json::from_value(json!(
      { "AddPathComponent": {"pathId": "path_2", "parentPathId": "path_1", "name": "completed"}}
    ))
    .expect("commands should be valid endpoint events");

    let new_events = projection
      .execute(command)
      .expect("new command should be applicable to initial projection");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!("can_handle_add_path_component__new_events", new_events);

    let unassignable_path: EndpointCommand = serde_json::from_value(json!(
      { "AddPathComponent": {"pathId": "path_1", "parentPathId": "root", "name": "completed"}}
    ))
    .unwrap();
    let unassignable_path_result = projection.execute(unassignable_path);
    assert!(unassignable_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_path_component__unassignable_path_result",
      unassignable_path_result.unwrap_err()
    );

    let unexisting_parent: EndpointCommand = serde_json::from_value(json!(
      { "AddPathComponent": {"pathId": "path_2", "parentPathId": "not-a-path", "name": "completed"}}
    ))
    .unwrap();
    let unexisting_parent_result = projection.execute(unexisting_parent);
    assert!(unexisting_parent_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_path_component__unexisting_parent_result",
      unexisting_parent_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event);
    }
  }

  #[test]
  pub fn can_handle_rename_path_component_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = EndpointProjection::from(initial_events);

    let command: EndpointCommand = serde_json::from_value(json!(
      { "RenamePathComponent": {"pathId": "path_1", "name": "tasks"}}
    ))
    .expect("commands should be valid endpoint events");

    let new_events = projection
      .execute(command)
      .expect("new command should be applicable to initial projection");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_rename_path_component_command__new_events",
      new_events
    );

    let renaming_root: EndpointCommand = serde_json::from_value(json!(
      { "RenamePathComponent": {"pathId": "root", "name": "tasks"}}
    ))
    .unwrap();
    let renaming_root_result = projection.execute(renaming_root);
    assert!(renaming_root_result.is_err());
    assert_debug_snapshot!(
      "can_handle_rename_path_component_command__renaming_root_result",
      renaming_root_result.unwrap_err()
    );

    let unexisting_path: EndpointCommand = serde_json::from_value(json!(
      { "RenamePathComponent": {"pathId": "not-a-path", "name": "tasks"}}
    ))
    .unwrap();
    let unexisting_path_result = projection.execute(unexisting_path);
    assert!(unexisting_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_rename_path_component_command__unexisting_path_result",
      unexisting_path_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event);
    }
  }

  #[test]
  pub fn can_handle_remove_path_component_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = EndpointProjection::from(initial_events);

    let command: EndpointCommand = serde_json::from_value(json!(
      { "RemovePathComponent": {"pathId": "path_1"}}
    ))
    .expect("commands should be valid endpoint events");

    let new_events = projection
      .execute(command)
      .expect("new command should be applicable to initial projection");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_remove_path_component_command__new_events",
      new_events
    );

    let removing_root: EndpointCommand = serde_json::from_value(json!(
      { "RemovePathComponent": {"pathId": "root"}}
    ))
    .unwrap();
    let removing_root_result = projection.execute(removing_root);
    assert!(removing_root_result.is_err());
    assert_debug_snapshot!(
      "can_handle_remove_path_component_command__removing_root_result",
      removing_root_result.unwrap_err()
    );

    let unexisting_path: EndpointCommand = serde_json::from_value(json!(
      { "RemovePathComponent": {"pathId": "not-a-path-id"}}
    ))
    .unwrap();
    let unexisting_path_result = projection.execute(unexisting_path);
    assert!(unexisting_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_remove_path_component_command__unexisting_path_result",
      unexisting_path_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event);
    }
  }

  #[test]
  pub fn can_handle_add_path_parameter_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = EndpointProjection::from(initial_events);

    let command: EndpointCommand = serde_json::from_value(json!(
      { "AddPathParameter": {"pathId": "path_2", "parentPathId": "path_1", "name": "todoId"}}
    ))
    .expect("commands should be valid endpoint events");

    let new_events = projection
      .execute(command)
      .expect("new command should be applicable to initial projection");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!("can_handle_add_path_parameter__new_events", new_events);

    let unassignable_path: EndpointCommand = serde_json::from_value(json!(
      { "AddPathParameter": {"pathId": "path_1", "parentPathId": "path_1", "name": "todoId"}}
    ))
    .unwrap();
    let unassignable_path_result = projection.execute(unassignable_path);
    assert!(unassignable_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_path_parameter__unassignable_path_result",
      unassignable_path_result.unwrap_err()
    );

    let unexisting_parent: EndpointCommand = serde_json::from_value(json!(
      { "AddPathParameter": {"pathId": "path_2", "parentPathId": "not-a-path", "name": "completed"}}
    ))
    .unwrap();
    let unexisting_parent_result = projection.execute(unexisting_parent);
    assert!(unexisting_parent_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_path_parameter__unexisting_parent_result",
      unexisting_parent_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event);
    }
  }

  #[test]
  pub fn can_handle_rename_path_parameter_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"PathParameterAdded": {"pathId": "path_2","parentPathId": "path_1","name": "todoId"}},
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = EndpointProjection::from(initial_events);

    let command: EndpointCommand = serde_json::from_value(json!(
      { "RenamePathParameter": {"pathId": "path_1", "name": "taskId"}}
    ))
    .expect("commands should be valid endpoint events");

    let new_events = projection
      .execute(command)
      .expect("new command should be applicable to initial projection");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_rename_path_parameter_command__new_events",
      new_events
    );

    let renaming_root: EndpointCommand = serde_json::from_value(json!(
      { "RenamePathParameter": {"pathId": "root", "name": "taskId"}}
    ))
    .unwrap();
    let renaming_root_result = projection.execute(renaming_root);
    assert!(renaming_root_result.is_err());
    assert_debug_snapshot!(
      "can_handle_rename_path_parameter_command__renaming_root_result",
      renaming_root_result.unwrap_err()
    );

    let unexisting_path: EndpointCommand = serde_json::from_value(json!(
      { "RenamePathParameter": {"pathId": "not-a-path", "name": "taskId"}}
    ))
    .unwrap();
    let unexisting_path_result = projection.execute(unexisting_path);
    assert!(unexisting_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_rename_path_parameter_command__unexisting_path_result",
      unexisting_path_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event);
    }
  }

  #[test]
  pub fn can_handle_set_path_parameter_shape_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"PathParameterAdded": {"pathId": "path_2","parentPathId": "path_1","name": "todoId"}},
      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"",}}
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = EndpointProjection::from(initial_events);

    let valid_command: EndpointCommand = serde_json::from_value(json!(
      {"SetPathParameterShape":{"pathId":"path_2","shapedRequestParameterShapeDescriptor":{"shapeId":"string_shape_1","isRemoved":false}}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_set_path_parameter_shape_command__new_events",
      new_events
    );

    let setting_root_path: EndpointCommand = serde_json::from_value(json!(
      {"SetPathParameterShape":{"pathId":"root","shapedRequestParameterShapeDescriptor":{"shapeId":"string_shape_1","isRemoved":false}}}
    )).unwrap();
    let setting_root_path_result = projection.execute(setting_root_path);
    assert!(setting_root_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_path_parameter_shape_command__setting_root_path_result",
      setting_root_path_result.unwrap_err()
    );

    let unexisting_path: EndpointCommand = serde_json::from_value(json!(
      {"SetPathParameterShape":{"pathId":"not-a-path","shapedRequestParameterShapeDescriptor":{"shapeId":"string_shape_1","isRemoved":false}}}
    )).unwrap();
    let unexisting_path_result = projection.execute(unexisting_path);
    assert!(unexisting_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_path_parameter_shape_command__unexisting_path_result",
      unexisting_path_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_remove_path_parameter_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"PathParameterAdded": {"pathId": "path_2","parentPathId": "path_1","name": "todoId"}},
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = EndpointProjection::from(initial_events);

    let command: EndpointCommand = serde_json::from_value(json!(
      { "RemovePathParameter": {"pathId": "path_1"}}
    ))
    .expect("commands should be valid endpoint events");

    let new_events = projection
      .execute(command)
      .expect("new command should be applicable to initial projection");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_remove_path_parameter_command__new_events",
      new_events
    );

    let removing_root: EndpointCommand = serde_json::from_value(json!(
      { "RemovePathParameter": {"pathId": "root"}}
    ))
    .unwrap();
    let removing_root_result = projection.execute(removing_root);
    assert!(removing_root_result.is_err());
    assert_debug_snapshot!(
      "can_handle_remove_path_parameter_command__removing_root_result",
      removing_root_result.unwrap_err()
    );

    let unexisting_path: EndpointCommand = serde_json::from_value(json!(
      { "RemovePathParameter": {"pathId": "not-a-path-id"}}
    ))
    .unwrap();
    let unexisting_path_result = projection.execute(unexisting_path);
    assert!(unexisting_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_remove_path_parameter_command__unexisting_path_result",
      unexisting_path_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event);
    }
  }

  #[test]
  pub fn can_handle_add_request_command() {
    let initial_events: Vec<EndpointEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"RequestAdded": {"requestId": "request_1", "pathId": "path_1", "httpMethod": "GET"}}
    ]))
    .expect("initial events should be valid endpoint events");

    let mut projection = EndpointProjection::from(initial_events);

    let valid_command: EndpointCommand = serde_json::from_value(json!(
      {"AddRequest": {"requestId": "request_2", "pathId": "path_1", "httpMethod": "POST"}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!("can_handle_add_request_command__new_events", new_events);

    let unassignable_request: EndpointCommand = serde_json::from_value(json!(
      {"AddRequest": {"requestId": "request_1", "pathId": "path_1", "httpMethod": "POST"}}
    ))
    .unwrap();
    let unassignable_request_result = projection.execute(unassignable_request);
    assert!(unassignable_request_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_request_command__unassignable_request_result",
      unassignable_request_result.unwrap_err()
    );

    let unexisting_path: EndpointCommand = serde_json::from_value(json!(
      {"AddRequest": {"requestId": "request_2", "pathId": "not-a-path", "httpMethod": "POST"}}
    ))
    .unwrap();
    let unexisting_path_result = projection.execute(unexisting_path);
    assert!(unexisting_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_request_command__unexisting_path_result",
      unexisting_path_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_set_request_body_shape_command() {
    let initial_events: Vec<EndpointEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"RequestAdded": {"requestId": "request_1", "pathId": "path_1", "httpMethod": "POST"}}
    ]))
    .expect("initial events should be valid endpoint events");

    let mut projection = EndpointProjection::from(initial_events);

    let valid_command: EndpointCommand = serde_json::from_value(json!(
      {"SetRequestBodyShape": {"requestId": "request_1", "bodyDescriptor": { "httpContentType": "application/json", "shapeId": "shape_1", "isRemoved": false }}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_set_request_body_shape_command__new_events",
      new_events
    );

    let unexisting_request: EndpointCommand = serde_json::from_value(json!(
      {"SetRequestBodyShape": {"requestId": "not-a-request", "bodyDescriptor": { "httpContentType": "application/json", "shapeId": "shape_1", "isRemoved": false }}}
    ))
    .unwrap();
    let unexisting_request_result = projection.execute(unexisting_request);
    assert!(unexisting_request_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_request_body_shape_command__unexisting_request_result",
      unexisting_request_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_add_response_by_path_and_method_command() {
    let initial_events: Vec<EndpointEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"RequestAdded": {"requestId": "request_1", "pathId": "path_1", "httpMethod": "GET"}},
      {"ResponseAddedByPathAndMethod": {"responseId": "response_1", "pathId": "path_1", "httpMethod": "GET", "httpStatusCode": 200}}
    ]))
    .expect("initial events should be valid endpoint events");

    let mut projection = EndpointProjection::from(initial_events);

    let valid_command: EndpointCommand = serde_json::from_value(json!(
      {"AddResponseByPathAndMethod": {"responseId": "response_2", "pathId": "path_1", "httpMethod": "POST", "httpStatusCode": 201}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_add_response_by_path_and_method_command__new_events",
      new_events
    );

    let unassignable_response: EndpointCommand = serde_json::from_value(json!(
      {"AddResponseByPathAndMethod": {"responseId": "response_1", "pathId": "path_1", "httpMethod": "POST", "httpStatusCode": 201}}
    ))
    .unwrap();
    let unassignable_response_result = projection.execute(unassignable_response);
    assert!(unassignable_response_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_response_by_path_and_method_command__unassignable_response_result",
      unassignable_response_result.unwrap_err()
    );

    let unexisting_path: EndpointCommand = serde_json::from_value(json!(
      {"AddResponseByPathAndMethod": {"responseId": "response_2", "pathId": "not-a-path", "httpMethod": "POST", "httpStatusCode": 201}}
    ))
    .unwrap();
    let unexisting_path_result = projection.execute(unexisting_path);
    assert!(unexisting_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_response_by_path_and_method_command__unexisting_path_result",
      unexisting_path_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_set_response_body_shape_command() {
    let initial_events: Vec<EndpointEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"RequestAdded": {"requestId": "request_1", "pathId": "path_1", "httpMethod": "POST"}},
      {"ResponseAddedByPathAndMethod": {"responseId": "response_1", "pathId": "path_1", "httpMethod": "GET", "httpStatusCode": 200}}
    ]))
    .expect("initial events should be valid endpoint events");

    let mut projection = EndpointProjection::from(initial_events);

    let valid_command: EndpointCommand = serde_json::from_value(json!(
      {"SetResponseBodyShape": {"responseId": "response_1", "bodyDescriptor": { "httpContentType": "application/json", "shapeId": "shape_1", "isRemoved": false }}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_set_response_body_shape_command__new_events",
      new_events
    );

    let unexisting_response: EndpointCommand = serde_json::from_value(json!(
      {"SetResponseBodyShape": {"responseId": "not-a-response", "bodyDescriptor": { "httpContentType": "application/json", "shapeId": "shape_1", "isRemoved": false }}}
    ))
    .unwrap();
    let unexisting_response_result = projection.execute(unexisting_response);
    assert!(unexisting_response_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_response_body_shape_command__unexisting_response_result",
      unexisting_response_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }
}
