use crate::state::shape::{
  FieldId, FieldShapeDescriptor, ParameterShapeDescriptor, ShapeId, ShapeParameterId,
  ShapeParametersDescriptor,
};
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
  shape_id: ShapeId,
  base_shape_id: ShapeId,
  name: String,
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
