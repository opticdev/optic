use serde::Deserialize;

pub type ShapeId = String;
pub type ShapeIdRef<'a> = &'a str;
pub type FieldId = String;
pub type ShapeParameterId = String;
pub type ShapeParameterIdRef<'a> = &'a str;

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

pub enum ShapeKind {
  ObjectKind,
  ListKind,
  MapKind,
  OneOfKind,
  AnyKind,
  StringKind,
  NumberKind,
  BooleanKind,
  IdentifierKind,
  ReferenceKind,
  NullableKind,
  OptionalKind,
  UnknownKind,
}

impl ShapeKind {
  pub fn get_descriptor(&self) -> ShapeKindDescriptor {
    match self {
      Self::ObjectKind => ShapeKindDescriptor {
        base_shape_id: "$object",
        name: "Object",
      },
      Self::ListKind => ShapeKindDescriptor {
        base_shape_id: "$list",
        name: "List",
      },
      Self::MapKind => ShapeKindDescriptor {
        base_shape_id: "$map",
        name: "Map",
      },
      Self::OneOfKind => ShapeKindDescriptor {
        base_shape_id: "$oneOf",
        name: "OneOf",
      },
      Self::AnyKind => ShapeKindDescriptor {
        base_shape_id: "$any",
        name: "Any",
      },
      Self::StringKind => ShapeKindDescriptor {
        base_shape_id: "$string",
        name: "String",
      },
      Self::NumberKind => ShapeKindDescriptor {
        base_shape_id: "$number",
        name: "Number",
      },
      Self::BooleanKind => ShapeKindDescriptor {
        base_shape_id: "$boolean",
        name: "Boolean",
      },
      Self::IdentifierKind => ShapeKindDescriptor {
        base_shape_id: "$identifier",
        name: "Identifier",
      },
      Self::ReferenceKind => ShapeKindDescriptor {
        base_shape_id: "$reference",
        name: "Reference",
      },
      Self::NullableKind => ShapeKindDescriptor {
        base_shape_id: "$nullable",
        name: "Nullable",
      },
      Self::OptionalKind => ShapeKindDescriptor {
        base_shape_id: "$optional",
        name: "Optional",
      },
      Self::UnknownKind => ShapeKindDescriptor {
        base_shape_id: "$unknown",
        name: "Unknown",
      },
    }
  }
}

pub struct ShapeKindDescriptor {
  pub base_shape_id: &'static str,
  pub name: &'static str,
}
