use super::EventContext;
use crate::state::shape::{FieldShapeDescriptor, ShapeParametersDescriptor, ParameterShapeDescriptor};
use cqrs_core::Event;
use serde::Deserialize;

type ShapeId = String;
type ShapeParameterId = String;
type FieldId = String;

#[derive(Deserialize, Debug)]
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

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ShapeAdded {
  pub shape_id: ShapeId,
  pub base_shape_id: ShapeId,
  pub parameters: ShapeParametersDescriptor,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BaseShapeSet {
pub   shape_id: ShapeId,
  pub base_shape_id: ShapeId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ShapeRenamed {
  pub shape_id: ShapeId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ShapeRemoved {
  pub shape_id: ShapeId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ShapeParameterAdded {
  pub shape_parameter_id: ShapeParameterId,
  pub shape_id: ShapeId,
  pub name: String,
  pub shape_descriptor: ShapeParametersDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ShapeParameterShapeSet {
  pub shape_descriptor: ParameterShapeDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ShapeParameterRenamed {
  pub shape_parameter_id: ShapeParameterId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ShapeParameterRemoved {
  pub shape_parameter_id: ShapeParameterId,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FieldAdded {
  pub field_id: FieldId,
  pub shape_id: ShapeId,
  pub name: String,
  pub shape_descriptor: FieldShapeDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FieldShapeSet {
  pub shape_descriptor: FieldShapeDescriptor,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FieldRenamed {
  pub field_id: FieldId,
  pub name: String,
  pub event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug)]
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
