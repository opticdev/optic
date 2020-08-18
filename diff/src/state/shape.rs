use serde::Deserialize;

pub type ShapeId = String;
pub type FieldId = String;
type ShapeParameterId = String;

#[derive(Debug, Deserialize)]
pub enum FieldShapeDescriptor {
  FieldShapeFromShape(FieldShapeFromShape),
  FieldShapeFromParameter(FieldShapeFromParameter),
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldShapeFromShape {
  field_id: FieldId,
  shape_id: ShapeId,
}
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FieldShapeFromParameter {
  field_id: FieldId,
  shape_parameter_id: ShapeParameterId,
}

#[derive(Debug, Deserialize)]
pub enum ShapeParametersDescriptor {
  NoParameterList,
  StaticParameterList(StaticShapeParametersDescriptor),
  DynamicParameterList(DynamicShapeParametersDescriptor),
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StaticShapeParametersDescriptor {
  shape_parameter_ids: Vec<ShapeParameterId>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DynamicShapeParametersDescriptor {
  shape_parameter_ids: Vec<ShapeParameterId>,
}
