use super::{EndpointCommand, SpecCommand, SpecCommandError};
use crate::{events::shape as shape_events, shapehash::ShapeDescriptor, state::shape::ShapeProvider};
use crate::events::ShapeEvent;
use crate::projections::ShapeProjection;
use crate::state::shape::{
  FieldId, FieldShapeDescriptor, FieldShapeFromShape, ParameterShapeDescriptor, ProviderDescriptor, ProviderInShape, ShapeId, ShapeKind,
  ShapeParameterId, ShapeParametersDescriptor,
};
use cqrs_core::AggregateCommand;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug, Clone, Serialize)]
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
  pub fn add_shape(shape_id: ShapeId, shape_kind: ShapeKind, name: String) -> Self {
    Self::AddShape(AddShape::new(shape_id, String::from(shape_kind.get_descriptor().base_shape_id), name))
  }

  pub fn add_shape_parameter(shape_parameter_id: ShapeParameterId, shape_id: ShapeId, name: String) -> Self {
    Self::AddShapeParameter(AddShapeParameter { shape_parameter_id, shape_id, name })
  }

  pub fn set_parameter_shape(shape_id: ShapeId, consuming_parameter_id: ShapeParameterId, provided_shape_id: ShapeId) -> Self {
    let provider = ProviderInShape {
      shape_id,
      consuming_parameter_id,
      provider_descriptor: ProviderDescriptor::ShapeProvider(ShapeProvider { shape_id: provided_shape_id })
    };

    Self::SetParameterShape(SetParameterShape { shape_descriptor: ParameterShapeDescriptor::ProviderInShape(provider) })
  }

  pub fn add_field(key: String, field_id: ShapeId, object_shape_id: ShapeId, field_shape_id: ShapeId) -> Self {
    Self::AddField(AddField {
      shape_id: object_shape_id,
      field_id: field_id.clone(),
      name: key,
      shape_descriptor: FieldShapeDescriptor::FieldShapeFromShape(FieldShapeFromShape {
        field_id,
        shape_id: field_shape_id
      })
    })
  }
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddShape {
  pub shape_id: ShapeId,
  pub base_shape_id: ShapeId,
  pub name: String,
}

impl AddShape {
  pub fn new(shape_id: ShapeId, base_shape_id: ShapeId, name: String) -> Self {
    AddShape {
      shape_id,
      base_shape_id,
      name,
    }
  }
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetBaseShape {
  pub shape_id: ShapeId,
  pub base_shape_id: ShapeId,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameShape {
  shape_id: ShapeId,
  name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveShape {
  shape_id: ShapeId,
}

// Shape parameters
// ----------------

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddShapeParameter {
  pub shape_parameter_id: ShapeParameterId,
  pub shape_id: ShapeId,
  pub name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveShapeParameter {
  shape_parameter_id: ShapeParameterId,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameShapeParameter {
  shape_parameter_id: ShapeParameterId,
  name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetParameterShape {
  pub shape_descriptor: ParameterShapeDescriptor,
}

// Fields
// ------

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddField {
  pub field_id: FieldId,
  pub shape_id: ShapeId,
  pub name: String,
  pub shape_descriptor: FieldShapeDescriptor,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RenameField {
  field_id: FieldId,
  name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveField {
  field_id: FieldId,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetFieldShape {
  pub shape_descriptor: FieldShapeDescriptor,
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
      // Shapes
      // ------
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

      ShapeCommand::SetBaseShape(command) => {
        validation.require(
          validation.shape_id_exists(&command.shape_id),
          "shape must exist to set base shape",
        )?;
        validation.require(
          !validation.base_shape_id_exists(&command.shape_id),
          "shape must not be base shape to set base shape",
        )?;
        validation.require(
          validation.base_shape_id_exists(&command.base_shape_id),
          "base shape must exist to set base shape",
        )?;

        vec![ShapeEvent::from(shape_events::BaseShapeSet::from(command))]
      }

      // Fields
      // ------
      ShapeCommand::AddField(command) => {
        validation.require(
          !validation.field_id_exists(&command.field_id),
          "field id must be assignable to add field",
        )?;
        validation.require(
          validation.shape_id_exists(&command.shape_id),
          "shape must exist to add field",
        )?;
        validation.require(
          validation.shape_can_have_fields(&command.shape_id),
          "shape must support fields to add field",
        )?;

        let events = match &command.shape_descriptor {
          FieldShapeDescriptor::FieldShapeFromParameter(descriptor) => {
            Err(SpecCommandError::Unimplemented(
              "FieldShapeFromParameter shape descriptor not implemented for add field command",
              SpecCommand::ShapeCommand(ShapeCommand::AddField(command)),
            ))?
          }
          FieldShapeDescriptor::FieldShapeFromShape(descriptor) => {
            validation.require(
              validation.shape_id_exists(&descriptor.shape_id),
              "shape of shape descriptor must exist to add field",
            )?;
            vec![ShapeEvent::from(shape_events::FieldAdded::from(command))]
          }
        };

        events
      }

      ShapeCommand::SetFieldShape(command) => match &command.shape_descriptor {
        FieldShapeDescriptor::FieldShapeFromParameter(descriptor) => {
          Err(SpecCommandError::Unimplemented(
            "FieldShapeFromParameter shape descriptor not implemented for set field shape",
            SpecCommand::ShapeCommand(ShapeCommand::SetFieldShape(command)),
          ))?
        }
        FieldShapeDescriptor::FieldShapeFromShape(descriptor) => {
          validation.require(
            validation.field_id_exists(&descriptor.field_id),
            "field of shape descriptor must exist to set field shape",
          )?;
          validation.require(
            validation.shape_id_exists(&descriptor.shape_id),
            "shape of shape descriptor must exist to set field shape",
          )?;

          vec![ShapeEvent::from(shape_events::FieldShapeSet::from(command))]
        }
      },

      // Parameters
      // ----------
      ShapeCommand::AddShapeParameter(command) => {
        validation.require(
          validation.shape_id_exists(&command.shape_id),
          "shape must exist to add shape parameter",
        )?;
        validation.require(
          !validation.shape_parameter_id_exists(&command.shape_parameter_id),
          "shape parameter id must be assignable to add shape parameter",
        )?;

        vec![ShapeEvent::from(shape_events::ShapeParameterAdded::from(
          command,
        ))]
      }

      ShapeCommand::SetParameterShape(command) => match &command.shape_descriptor {
        ParameterShapeDescriptor::ProviderInShape(descriptor) => {
          validation.require(
            validation.shape_id_exists(&descriptor.shape_id),
            "shape must exist to set parameter shape",
          )?;
          validation.require(
            validation.shape_parameter_id_exists(&descriptor.consuming_parameter_id),
            "consuming parameter must exist to set shape parameter shape",
          )?;

          match &descriptor.provider_descriptor {
            ProviderDescriptor::NoProvider(_) | ProviderDescriptor::ParameterProvider(_) => {
              Err(SpecCommandError::Unimplemented(
                "only ShapeProvider provider descriptor is implemented for set shape parameter shape",
                SpecCommand::ShapeCommand(ShapeCommand::SetParameterShape(command)),
              ))?
            }
            ProviderDescriptor::ShapeProvider(provider) => {
              validation.require(
                validation.shape_id_exists(&provider.shape_id),
                "provided shape must exist to set shape parameter shape",
              )?;
              
              vec![ShapeEvent::from(shape_events::ShapeParameterShapeSet::from(command))]
            }
          }
        }
        ParameterShapeDescriptor::ProviderInField(provider) => {
          Err(SpecCommandError::Unimplemented(
            "ProviderInFIeld shape descriptor not implemented for set parameter shape",
            SpecCommand::ShapeCommand(ShapeCommand::SetParameterShape(command)),
          ))?
        }
      },

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

  fn shape_parameter_id_exists(&self, shape_param_id: &ShapeParameterId) -> bool {
    self
      .shape_projection
      .get_shape_parameter_node_index(shape_param_id)
      .is_some()
  }

  fn field_id_exists(&self, field_id: &FieldId) -> bool {
    self
      .shape_projection
      .get_field_node_index(field_id)
      .is_some()
  }

  fn shape_can_have_fields(&self, shape_id: &ShapeId) -> bool {
    let shape_node_index = self.shape_projection.get_shape_node_index(shape_id);

    if let None = shape_node_index {
      false
    } else {
      self
        .shape_projection
        .get_core_shape_kinds(shape_node_index.unwrap())
        .expect("shape node exists as we just resolved it, so we get iterator")
        .any(|shape_kind| matches!(shape_kind, ShapeKind::ObjectKind))
    }
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

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_set_base_shape_command() {
    let initial_events: Vec<ShapeEvent> = serde_json::from_value(json!([
      {"ShapeAdded":{"shapeId":"shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"shape_2","baseShapeId":"$number","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}}
    ]))
    .expect("initial events should be valid shape events");

    let mut projection = ShapeProjection::from(initial_events);

    let valid_command: ShapeCommand = serde_json::from_value(json!(
      {"SetBaseShape":{"shapeId":"shape_1","baseShapeId":"$number" }}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!("can_handle_set_base_shape_command__new_events", new_events);

    let unexisting_shape: ShapeCommand = serde_json::from_value(json!(
      {"SetBaseShape":{"shapeId":"not-a-shape","baseShapeId":"$number" }}
    ))
    .unwrap();
    let unexisting_shape_result = projection.execute(unexisting_shape);
    assert!(unexisting_shape_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_base_shape_command__unexisting_shape_result",
      unexisting_shape_result.unwrap_err()
    );

    let setting_base_shape: ShapeCommand = serde_json::from_value(json!(
      {"SetBaseShape":{"shapeId":"$string","baseShapeId":"$number" }}
    ))
    .unwrap();
    let setting_base_shape_result = projection.execute(setting_base_shape);
    assert!(setting_base_shape_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_base_shape_command__setting_base_shape_result",
      setting_base_shape_result.unwrap_err()
    );

    let non_base_shape: ShapeCommand = serde_json::from_value(json!(
      {"SetBaseShape":{"shapeId":"shape_1","baseShapeId":"shape_2" }}
    ))
    .unwrap();
    let non_base_shape_result = projection.execute(non_base_shape);
    assert!(non_base_shape_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_base_shape_command__non_base_shape_result",
      non_base_shape_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_add_field_command() {
    let initial_events: Vec<ShapeEvent> = serde_json::from_value(json!([
      {"ShapeAdded":{"shapeId":"shape_1","baseShapeId":"$object","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"shape_2","baseShapeId":"$number","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"shape_3","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"FieldAdded":{"fieldId": "field_1", "shapeId": "shape_1", "name": "likesCount", "shapeDescriptor":{ "FieldShapeFromShape": { "shapeId": "shape_2", "fieldId": "field_1"}}}}
    ]))
    .expect("initial events should be valid shape events");

    let mut projection = ShapeProjection::from(initial_events);

    let valid_command: ShapeCommand = serde_json::from_value(json!(
      {"AddField":{"fieldId": "field_2", "shapeId": "shape_1", "name": "username", "shapeDescriptor":{ "FieldShapeFromShape": { "shapeId": "shape_3", "fieldId": "field_2"}}}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!("can_handle_add_field_command__new_events", new_events);

    let unexisting_object_shape: ShapeCommand = serde_json::from_value(json!(
      {"AddField":{"fieldId": "field_2", "shapeId": "not-a-shape", "name": "username", "shapeDescriptor":{ "FieldShapeFromShape": { "shapeId": "shape_3", "fieldId": "field_2"}}}}
    ))
    .unwrap();
    let unexisting_object_shape_result = projection.execute(unexisting_object_shape);
    assert!(unexisting_object_shape_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_field_command__unexisting_object_shape_result",
      unexisting_object_shape_result.unwrap_err()
    );

    let unassignable_field: ShapeCommand = serde_json::from_value(json!(
      {"AddField":{"fieldId": "field_1", "shapeId": "shape_1", "name": "username", "shapeDescriptor":{ "FieldShapeFromShape": { "shapeId": "shape_3", "fieldId": "field_2"}}}}
    ))
    .unwrap();
    let unassignable_field_result = projection.execute(unassignable_field);
    assert!(unassignable_field_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_field_command__unassignable_field_result",
      unassignable_field_result.unwrap_err()
    );

    let non_object_shape: ShapeCommand = serde_json::from_value(json!(
      {"AddField":{"fieldId": "field_2", "shapeId": "shape_2", "name": "username", "shapeDescriptor":{ "FieldShapeFromShape": { "shapeId": "shape_3", "fieldId": "field_2"}}}}
    ))
    .unwrap();
    let non_object_shape_result = projection.execute(non_object_shape);
    assert!(non_object_shape_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_field_command__non_object_shape_result",
      non_object_shape_result.unwrap_err()
    );

    let unexisting_field_shape: ShapeCommand = serde_json::from_value(json!(
      {"AddField":{"fieldId": "field_2", "shapeId": "shape_1", "name": "username", "shapeDescriptor":{ "FieldShapeFromShape": { "shapeId": "not-a-shape", "fieldId": "field_2"}}}}
    ))
    .unwrap();
    let unexisting_field_shape_result = projection.execute(unexisting_field_shape);
    assert!(unexisting_field_shape_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_field_command__unexisting_field_shape_result",
      unexisting_field_shape_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_set_field_shape_command() {
    let initial_events: Vec<ShapeEvent> = serde_json::from_value(json!([
      {"ShapeAdded":{"shapeId":"shape_1","baseShapeId":"$object","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"shape_2","baseShapeId":"$number","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"shape_3","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"FieldAdded":{"fieldId": "field_1", "shapeId": "shape_1", "name": "likesCount", "shapeDescriptor":{ "FieldShapeFromShape": { "shapeId": "shape_2", "fieldId": "field_1"}}}}
    ]))
    .expect("initial events should be valid shape events");

    let mut projection = ShapeProjection::from(initial_events);

    let valid_command: ShapeCommand = serde_json::from_value(json!(
      {"SetFieldShape":{"shapeDescriptor":{ "FieldShapeFromShape":{ "shapeId": "shape_3", "fieldId": "field_1"}}}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!("can_handle_set_field_shape_command__new_events", new_events);

    let unexisting_field: ShapeCommand = serde_json::from_value(json!(
      {"SetFieldShape":{"shapeDescriptor":{ "FieldShapeFromShape":{ "shapeId": "shape_3", "fieldId": "not-a-field"}}}}
    ))
    .unwrap();
    let unexisting_field_result = projection.execute(unexisting_field);
    assert!(unexisting_field_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_field_shape_command__unexisting_field_result",
      unexisting_field_result.unwrap_err()
    );

    let unexisting_field_shape: ShapeCommand = serde_json::from_value(json!(
      {"SetFieldShape":{"shapeDescriptor":{ "FieldShapeFromShape":{ "shapeId": "not-a-shape", "fieldId": "field_1"}}}}
    ))
    .unwrap();
    let unexisting_field_shape_result = projection.execute(unexisting_field_shape);
    assert!(unexisting_field_shape_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_field_shape_command__unexisting_field_shape_result",
      unexisting_field_shape_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_add_shape_parameter() {
    let initial_events: Vec<ShapeEvent> = serde_json::from_value(json!([
      {"ShapeAdded":{"shapeId":"one_off_shape_1","baseShapeId":"$oneOf","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"" }},
      {"ShapeParameterAdded": {"shapeParameterId": "shape_parameter_1", "shapeId": "one_off_shape_1","name": "","shapeDescriptor": {"ProviderInShape": {"shapeId": "one_off_shape_1","providerDescriptor": {"NoProvider": {}},"consumingParameterId": "shape_parameter_1"}}}},
    ]))
    .expect("initial events should be valid shape events");

    let mut projection = ShapeProjection::from(initial_events);

    let valid_command: ShapeCommand = serde_json::from_value(json!(
      {"AddShapeParameter": {"shapeParameterId": "shape_parameter_2", "shapeId": "one_off_shape_1","name": "","shapeDescriptor": {"ProviderInShape": {"shapeId": "one_off_shape_1","providerDescriptor": {"NoProvider": {}},"consumingParameterId": "shape_parameter_2"}}}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!("can_handle_add_shape_parameter__new_events", new_events);

    let unassignable_shape_parameter_id: ShapeCommand = serde_json::from_value(json!(
      {"AddShapeParameter": {"shapeParameterId": "shape_parameter_1", "shapeId": "one_off_shape_1","name": "","shapeDescriptor": {"ProviderInShape": {"shapeId": "one_off_shape_1","providerDescriptor": {"NoProvider": {}},"consumingParameterId": "shape_parameter_1"}}}}
    ))
    .unwrap();
    let unassignable_shape_parameter_id_result =
      projection.execute(unassignable_shape_parameter_id);
    assert!(unassignable_shape_parameter_id_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_shape_parameter__unassignable_shape_parameter_id_result",
      unassignable_shape_parameter_id_result.unwrap_err()
    );

    let unexisting_shape_id: ShapeCommand = serde_json::from_value(json!(
      {"AddShapeParameter": {"shapeParameterId": "shape_parameter_2", "shapeId": "not-a-shape","name": "","shapeDescriptor": {"ProviderInShape": {"shapeId": "one_off_shape_1","providerDescriptor": {"NoProvider": {}},"consumingParameterId": "shape_parameter_2"}}}}
    ))
    .unwrap();
    let unexisting_shape_id_result = projection.execute(unexisting_shape_id);
    assert!(unexisting_shape_id_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_shape_parameter__unexisting_shape_id_result",
      unexisting_shape_id_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_set_parameter_shape_command() {
    let initial_events: Vec<ShapeEvent> = serde_json::from_value(json!([
      {"ShapeAdded":{"shapeId":"nullable_shape_1","baseShapeId":"$nullable","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"" }},
      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"" }},
    ]))
    .expect("initial events should be valid shape events");

    let mut projection = ShapeProjection::from(initial_events);

    let valid_command: ShapeCommand = serde_json::from_value(json!(
      {"SetParameterShape": {"shapeDescriptor": {"ProviderInShape": {"shapeId": "nullable_shape_1","providerDescriptor": {"ShapeProvider": { "shapeId": "string_shape_1" }},"consumingParameterId": "$nullableInner"}}}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!("can_handle_set_parameter_shape_command__new_events", new_events);

    let unexisting_shape_parameter_id: ShapeCommand = serde_json::from_value(json!(
      {"SetParameterShape": {"shapeDescriptor": {"ProviderInShape": {"shapeId": "nullable_shape_1","providerDescriptor": {"ShapeProvider": { "shapeId": "string_shape_1" }},"consumingParameterId": "not-a-shape-parameter-id"}}}}
    ))
    .unwrap();
    let unexisting_shape_parameter_id_result =
      projection.execute(unexisting_shape_parameter_id);
    assert!(unexisting_shape_parameter_id_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_parameter_shape_command__unexisting_shape_parameter_id_result",
      unexisting_shape_parameter_id_result.unwrap_err()
    );

    let unexisting_shape_id: ShapeCommand = serde_json::from_value(json!(
      {"SetParameterShape": {"shapeDescriptor": {"ProviderInShape": {"shapeId": "not-a-shape-id","providerDescriptor": {"ShapeProvider": { "shapeId": "string_shape_1" }},"consumingParameterId": "$nullableInner"}}}}
    ))
    .unwrap();
    let unexisting_shape_id_result =
      projection.execute(unexisting_shape_id);
    assert!(unexisting_shape_id_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_parameter_shape_command__unexisting_shape_id_result",
      unexisting_shape_id_result.unwrap_err()
    );

    let unexisting_provided_shape_id: ShapeCommand = serde_json::from_value(json!(
      {"SetParameterShape": {"shapeDescriptor": {"ProviderInShape": {"shapeId": "nullable_shape_1","providerDescriptor": {"ShapeProvider": { "shapeId": "not-a-shape-id" }},"consumingParameterId": "$nullableInner"}}}}
    ))
    .unwrap();
    let unexisting_provided_shape_id_result =
      projection.execute(unexisting_provided_shape_id);
    assert!(unexisting_provided_shape_id_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_parameter_shape_command__unexisting_provided_shape_id_result",
      unexisting_provided_shape_id_result.unwrap_err()
    );
    let no_shape_provider: ShapeCommand = serde_json::from_value(json!(
      {"SetParameterShape": {"shapeDescriptor": {"ProviderInShape": {"shapeId": "nullable_shape_1","providerDescriptor": {"NoProvider": {}},"consumingParameterId": "$nullableInner"}}}}
    ))
    .unwrap();
    let no_shape_provider_result =
      projection.execute(no_shape_provider);
    assert!(no_shape_provider_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_parameter_shape_command__no_shape_provider_result",
      no_shape_provider_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }
}
