use super::{EndpointCommand, SpecCommand, SpecCommandError};
use crate::events::shape as shape_events;
use crate::events::ShapeEvent;
use crate::projections::ShapeProjection;
use crate::state::shape::{
  FieldId, FieldShapeDescriptor, ParameterShapeDescriptor, ShapeId, ShapeParameterId,
  ShapeParametersDescriptor,
};
use cqrs_core::AggregateCommand;
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize, Debug, Clone)]
pub enum ShapeCommand {
  AddShape(AddShape),
  SetBaseShape(SetBaseShape),
  RenameShape(RenameShape),
  RemoveShape(RemoveShape),

  // Shape parameters
  AddShapeParameter(AddShapeParameter),
  RemoveShapeParameter(RemoveShapeParameter),
  RenameShapeParameter(RenameShapeParameter),
  SetParameterShape(SetParameterShape),

  // Fields
  AddField(AddField),
  RenameField(RenameField),
  RemoveField(RemoveField),
  SetFieldShape(SetFieldShape),
}

impl ShapeCommand {
  pub fn add_shape(base_shape_id: ShapeId, name: String) -> Self {
    Self::AddShape(AddShape::new(base_shape_id, name))
  }
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AddShape {
  pub shape_id: ShapeId,
  pub base_shape_id: ShapeId,
  pub name: String,
}

impl AddShape {
  pub fn new(base_shape_id: ShapeId, name: String) -> Self {
    AddShape {
      shape_id: Uuid::new_v4().to_hyphenated().to_string(),
      base_shape_id,
      name,
    }
  }
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SetBaseShape {
  shape_id: ShapeId,
  base_shape_id: ShapeId,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RenameShape {
  shape_id: ShapeId,
  name: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RemoveShape {
  shape_id: ShapeId,
}

// Shape parameters
// ----------------

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AddShapeParameter {
  shape_parameter_id: ShapeParameterId,
  shape_id: ShapeId,
  name: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RemoveShapeParameter {
  shape_parameter_id: ShapeParameterId,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RenameShapeParameter {
  shape_parameter_id: ShapeParameterId,
  name: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SetParameterShape {
  shape_descriptor: ParameterShapeDescriptor,
}

// Fields
// ------

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AddField {
  field_id: FieldId,
  shape_id: ShapeId,
  name: String,
  shape_descriptor: FieldShapeDescriptor,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RenameField {
  field_id: FieldId,
  name: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct RemoveField {
  field_id: FieldId,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SetFieldShape {
  shape_descriptor: FieldShapeDescriptor,
}

// Command handling
// ----------------

impl AggregateCommand<ShapeProjection> for EndpointCommand {
  type Error = SpecCommandError;
  type Event = ShapeEvent;
  type Events = Vec<ShapeEvent>;

  fn execute_on(self, projection: &ShapeProjection) -> Result<Self::Events, Self::Error> {
    let validation = CommandValidationQueries::from((projection, &self));

    let events = match self {
      EndpointCommand::SetPathParameterShape(command) => {
        validation.require(
          validation.shape_id_exists(&command.shaped_request_parameter_shape_descriptor.shape_id),
          "shape must exist to set the path parameter shape",
        )?;

        vec![] // validation only
      }

      EndpointCommand::SetRequestBodyShape(command) => {
        validation.require(
          validation.shape_id_exists(&command.body_descriptor.shape_id),
          "shape must exist to set the request body shape",
        )?;

        vec![] // validation only
      }

      EndpointCommand::SetResponseBodyShape(command) => {
        validation.require(
          validation.shape_id_exists(&command.body_descriptor.shape_id),
          "shape must exist to set the request body shape",
        )?;

        vec![] // validation only
      }

      _ => Err(SpecCommandError::Unimplemented(
        "endpoint command not implemented for shape projection",
        SpecCommand::EndpointCommand(self),
      ))?,
    };

    Ok(events)
  }
}

impl AggregateCommand<ShapeProjection> for ShapeCommand {
  type Error = SpecCommandError;
  type Event = ShapeEvent;
  type Events = Vec<ShapeEvent>;

  fn execute_on(self, projection: &ShapeProjection) -> Result<Self::Events, Self::Error> {
    let validation = CommandValidationQueries::from((projection, &self));

    let events = match self {
      ShapeCommand::AddShape(command) => {
        validation.require(
          !validation.shape_id_exists(&command.shape_id),
          "shape id must be assignable to add shape",
        )?;
        validation.require(
          validation.base_shape_id_exists(&command.base_shape_id),
          "base shape id must exist to add shape",
        )?;

        vec![ShapeEvent::from(shape_events::ShapeAdded::from(command))]
      }

      _ => Err(SpecCommandError::Unimplemented(
        "shape command not implemented for shape projection",
        SpecCommand::ShapeCommand(self),
      ))?,
    };

    Ok(events)
  }
}

struct CommandValidationQueries<'a> {
  command_description: String,
  shape_projection: &'a ShapeProjection,
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

  fn shape_id_exists(&self, shape_id: &ShapeId) -> bool {
    self
      .shape_projection
      .get_shape_node_index(shape_id)
      .is_some()
  }

  fn base_shape_id_exists(&self, shape_id: &ShapeId) -> bool {
    self
      .shape_projection
      .get_core_shape_node_index(shape_id)
      .is_some()
  }
}

impl<'a> From<(&'a ShapeProjection, &EndpointCommand)> for CommandValidationQueries<'a> {
  fn from((shape_projection, endpoint_command): (&'a ShapeProjection, &EndpointCommand)) -> Self {
    Self {
      command_description: format!("{:?}", endpoint_command),
      shape_projection,
    }
  }
}

impl<'a> From<(&'a ShapeProjection, &ShapeCommand)> for CommandValidationQueries<'a> {
  fn from((shape_projection, shape_command): (&'a ShapeProjection, &ShapeCommand)) -> Self {
    Self {
      command_description: format!("{:?}", shape_command),
      shape_projection,
    }
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use cqrs_core::Aggregate;
  use insta::assert_debug_snapshot;
  use serde_json::json;

  #[test]
  pub fn can_handle_add_shape_command() {
    let initial_events: Vec<ShapeEvent> = serde_json::from_value(json!([
      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"",}}
    ]))
    .expect("initial events should be valid shape events");

    let mut projection = ShapeProjection::from(initial_events);

    let valid_command: ShapeCommand = serde_json::from_value(json!(
      {"AddShape":{"shapeId":"string_shape_2","baseShapeId":"$string","name":"test-name",}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!("can_handle_add_shape_command__new_events", new_events);

    let unassignable_shape_id: ShapeCommand = serde_json::from_value(json!(
      {"AddShape":{"shapeId":"string_shape_1","baseShapeId":"$string","name":"test-name",}}
    ))
    .unwrap();
    let unassignable_shape_id_result = projection.execute(unassignable_shape_id);
    assert!(unassignable_shape_id_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_shape_command__unassignable_shape_id_result",
      unassignable_shape_id_result.unwrap_err()
    );

    let invalid_base_shape_id: ShapeCommand = serde_json::from_value(json!(
      {"AddShape":{"shapeId":"string_shape_2","baseShapeId":"string_shape_1","name":"test-name",}}
    ))
    .unwrap();
    let invalid_base_shape_id_result = projection.execute(invalid_base_shape_id);
    assert!(invalid_base_shape_id_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_shape_command__invalid_base_shape_id_result",
      invalid_base_shape_id_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }
}
