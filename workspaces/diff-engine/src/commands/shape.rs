use super::{EndpointCommand, SpecCommand, SpecCommandError};
use crate::events::ShapeEvent;
use crate::projections::ShapeProjection;
use crate::state::shape::{
  FieldId, FieldShapeDescriptor, ParameterShapeDescriptor, ShapeId, ShapeParameterId,
  ShapeParametersDescriptor,
};
use cqrs_core::AggregateCommand;
use serde::Deserialize;

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

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AddShape {
  pub shape_id: ShapeId,
  pub base_shape_id: ShapeId,
  pub name: String,
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

      _ => Err(SpecCommandError::Unimplemented(
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
      _ => Err(SpecCommandError::Unimplemented(SpecCommand::ShapeCommand(
        self,
      )))?,
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
