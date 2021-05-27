use super::{EventContext, WithEventContext};
use crate::state::shape::{
  FieldShapeDescriptor, ParameterShapeDescriptor, ShapeParametersDescriptor,
};
use crate::{
  commands::shape as shape_commands,
  state::shape::{NoProvider, ProviderDescriptor, ProviderInShape},
};
use cqrs_core::Event;
use serde::{Deserialize, Serialize};
use shape_commands::ShapeCommand;

type ShapeId = String;
type ShapeParameterId = String;
type FieldId = String;

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
pub enum ShapeEvent {
  ShapeAdded(ShapeAdded),
  BaseShapeSet(BaseShapeSet),
  ShapeRenamed(ShapeRenamed),
  ShapeRemoved(ShapeRemoved),
  ShapeParameterAdded(ShapeParameterAdded),
  ShapeParameterShapeSet(ShapeParameterShapeSet),
  ShapeParameterRenamed(ShapeParameterRenamed),
  ShapeParameterRemoved(ShapeParameterRemoved),

  FieldAdded(FieldAdded),
  FieldShapeSet(FieldShapeSet),
  FieldRenamed(FieldRenamed),
  FieldRemoved(FieldRemoved),
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapeAdded {
  pub shape_id: ShapeId,
  pub base_shape_id: ShapeId,
  pub parameters: ShapeParametersDescriptor,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BaseShapeSet {
  pub shape_id: ShapeId,
  pub base_shape_id: ShapeId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapeRenamed {
  pub shape_id: ShapeId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapeRemoved {
  pub shape_id: ShapeId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapeParameterAdded {
  pub shape_parameter_id: ShapeParameterId,
  pub shape_id: ShapeId,
  pub name: String,
  pub shape_descriptor: ParameterShapeDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapeParameterShapeSet {
  pub shape_descriptor: ParameterShapeDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapeParameterRenamed {
  pub shape_parameter_id: ShapeParameterId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapeParameterRemoved {
  pub shape_parameter_id: ShapeParameterId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FieldAdded {
  pub field_id: FieldId,
  pub shape_id: ShapeId,
  pub name: String,
  pub shape_descriptor: FieldShapeDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FieldShapeSet {
  pub shape_descriptor: FieldShapeDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FieldRenamed {
  pub field_id: FieldId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FieldRemoved {
  pub field_id: FieldId,
  pub event_context: Option<EventContext>,
}

impl Event for ShapeEvent {
  fn event_type(&self) -> &'static str {
    match self {
      ShapeEvent::ShapeAdded(evt) => evt.event_type(),
      ShapeEvent::BaseShapeSet(evt) => evt.event_type(),
      ShapeEvent::ShapeRenamed(evt) => evt.event_type(),
      ShapeEvent::ShapeRemoved(evt) => evt.event_type(),
      ShapeEvent::ShapeParameterAdded(evt) => evt.event_type(),
      ShapeEvent::ShapeParameterShapeSet(evt) => evt.event_type(),
      ShapeEvent::ShapeParameterRenamed(evt) => evt.event_type(),
      ShapeEvent::ShapeParameterRemoved(evt) => evt.event_type(),

      ShapeEvent::FieldAdded(evt) => evt.event_type(),
      ShapeEvent::FieldShapeSet(evt) => evt.event_type(),
      ShapeEvent::FieldRenamed(evt) => evt.event_type(),
      ShapeEvent::FieldRemoved(evt) => evt.event_type(),
    }
  }
}

impl WithEventContext for ShapeEvent {
  fn with_event_context(&mut self, event_context: EventContext) {
    match self {
      ShapeEvent::ShapeAdded(evt) => evt.event_context.replace(event_context),
      ShapeEvent::BaseShapeSet(evt) => evt.event_context.replace(event_context),
      ShapeEvent::ShapeRenamed(evt) => evt.event_context.replace(event_context),
      ShapeEvent::ShapeRemoved(evt) => evt.event_context.replace(event_context),
      ShapeEvent::ShapeParameterAdded(evt) => evt.event_context.replace(event_context),
      ShapeEvent::ShapeParameterShapeSet(evt) => evt.event_context.replace(event_context),
      ShapeEvent::ShapeParameterRenamed(evt) => evt.event_context.replace(event_context),
      ShapeEvent::ShapeParameterRemoved(evt) => evt.event_context.replace(event_context),

      ShapeEvent::FieldAdded(evt) => evt.event_context.replace(event_context),
      ShapeEvent::FieldShapeSet(evt) => evt.event_context.replace(event_context),
      ShapeEvent::FieldRenamed(evt) => evt.event_context.replace(event_context),
      ShapeEvent::FieldRemoved(evt) => evt.event_context.replace(event_context),
    };
  }
}

impl Event for ShapeAdded {
  fn event_type(&self) -> &'static str {
    "ShapeAdded"
  }
}

impl Event for BaseShapeSet {
  fn event_type(&self) -> &'static str {
    "BaseShapeSet"
  }
}

impl Event for ShapeRenamed {
  fn event_type(&self) -> &'static str {
    "ShapeRenamed"
  }
}

impl Event for ShapeRemoved {
  fn event_type(&self) -> &'static str {
    "ShapeRemoved"
  }
}

impl Event for ShapeParameterAdded {
  fn event_type(&self) -> &'static str {
    "ShapeParameterAdded"
  }
}

impl Event for ShapeParameterShapeSet {
  fn event_type(&self) -> &'static str {
    "ShapeParameterShapeSet"
  }
}

impl Event for ShapeParameterRenamed {
  fn event_type(&self) -> &'static str {
    "ShapeParameterRenamed"
  }
}

impl Event for ShapeParameterRemoved {
  fn event_type(&self) -> &'static str {
    "ShapeParameterRemoved"
  }
}

impl Event for FieldAdded {
  fn event_type(&self) -> &'static str {
    "FieldAdded"
  }
}

impl Event for FieldShapeSet {
  fn event_type(&self) -> &'static str {
    "FieldShapeSet"
  }
}

impl Event for FieldRenamed {
  fn event_type(&self) -> &'static str {
    "FieldRenamed"
  }
}

impl Event for FieldRemoved {
  fn event_type(&self) -> &'static str {
    "FieldRemoved"
  }
}

impl From<ShapeAdded> for ShapeEvent {
  fn from(event: ShapeAdded) -> Self {
    Self::ShapeAdded(event)
  }
}

impl From<BaseShapeSet> for ShapeEvent {
  fn from(event: BaseShapeSet) -> Self {
    Self::BaseShapeSet(event)
  }
}

impl From<FieldAdded> for ShapeEvent {
  fn from(event: FieldAdded) -> Self {
    Self::FieldAdded(event)
  }
}

impl From<FieldShapeSet> for ShapeEvent {
  fn from(event: FieldShapeSet) -> Self {
    Self::FieldShapeSet(event)
  }
}

impl From<ShapeParameterAdded> for ShapeEvent {
  fn from(event: ShapeParameterAdded) -> Self {
    Self::ShapeParameterAdded(event)
  }
}

impl From<ShapeParameterShapeSet> for ShapeEvent {
  fn from(event: ShapeParameterShapeSet) -> Self {
    Self::ShapeParameterShapeSet(event)
  }
}

// Conversions from commands
// -------------------------

impl From<ShapeCommand> for ShapeEvent {
  fn from(shape_command: ShapeCommand) -> Self {
    match shape_command {
      ShapeCommand::AddShape(command) => ShapeEvent::from(ShapeAdded::from(command)),
      ShapeCommand::SetBaseShape(command) => ShapeEvent::from(BaseShapeSet::from(command)),
      ShapeCommand::AddField(command) => ShapeEvent::from(FieldAdded::from(command)),
      ShapeCommand::AddShapeParameter(command) => {
        ShapeEvent::from(ShapeParameterAdded::from(command))
      }
      ShapeCommand::SetParameterShape(command) => {
        ShapeEvent::from(ShapeParameterShapeSet::from(command))
      }
      _ => unimplemented!(
        "conversion from shape command to shape event not implemented for variant: {:?}",
        shape_command
      ),
    }
  }
}

impl From<shape_commands::AddShape> for ShapeAdded {
  fn from(command: shape_commands::AddShape) -> Self {
    Self {
      shape_id: command.shape_id,
      base_shape_id: command.base_shape_id,
      name: command.name,
      parameters: ShapeParametersDescriptor::empty_dynamic(),
      event_context: None,
    }
  }
}

impl From<shape_commands::SetBaseShape> for BaseShapeSet {
  fn from(command: shape_commands::SetBaseShape) -> Self {
    Self {
      shape_id: command.shape_id,
      base_shape_id: command.base_shape_id,
      event_context: None,
    }
  }
}

impl From<shape_commands::AddField> for FieldAdded {
  fn from(command: shape_commands::AddField) -> Self {
    Self {
      field_id: command.field_id,
      shape_id: command.shape_id,
      name: command.name,
      shape_descriptor: command.shape_descriptor,
      event_context: None,
    }
  }
}

impl From<shape_commands::SetFieldShape> for FieldShapeSet {
  fn from(command: shape_commands::SetFieldShape) -> Self {
    Self {
      shape_descriptor: command.shape_descriptor,
      event_context: None,
    }
  }
}

impl From<shape_commands::AddShapeParameter> for ShapeParameterAdded {
  fn from(command: shape_commands::AddShapeParameter) -> Self {
    Self {
      shape_id: command.shape_id.clone(),
      shape_parameter_id: command.shape_parameter_id.clone(),
      name: command.name,
      shape_descriptor: ParameterShapeDescriptor::ProviderInShape(ProviderInShape {
        shape_id: command.shape_id,
        provider_descriptor: ProviderDescriptor::default(),
        consuming_parameter_id: command.shape_parameter_id,
      }),
      event_context: None,
    }
  }
}

impl From<shape_commands::SetParameterShape> for ShapeParameterShapeSet {
  fn from(command: shape_commands::SetParameterShape) -> Self {
    Self {
      shape_descriptor: command.shape_descriptor,
      event_context: None,
    }
  }
}
