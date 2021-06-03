use serde::{Deserialize, Serialize};

pub type ShapeId = String;
pub type ShapeIdRef<'a> = &'a str;
pub type FieldId = String;
pub type ShapeParameterId = String;
pub type ShapeParameterIdRef<'a> = &'a str;
////////////////////////////////////////////////////////////////////////////////
#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
pub enum FieldShapeDescriptor {
  FieldShapeFromShape(FieldShapeFromShape),
  FieldShapeFromParameter(FieldShapeFromParameter),
}

#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FieldShapeFromShape {
  pub field_id: FieldId,
  pub shape_id: ShapeId,
}
#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FieldShapeFromParameter {
  pub field_id: FieldId,
  pub shape_parameter_id: ShapeParameterId,
}
////////////////////////////////////////////////////////////////////////////////
#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
pub enum ShapeParametersDescriptor {
  NoParameterList,
  StaticParameterList(StaticShapeParametersDescriptor),
  DynamicParameterList(DynamicShapeParametersDescriptor),
}

impl ShapeParametersDescriptor {
  pub fn empty_dynamic() -> Self {
    ShapeParametersDescriptor::DynamicParameterList(DynamicShapeParametersDescriptor {
      shape_parameter_ids: vec![],
    })
  }
}

#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StaticShapeParametersDescriptor {
  pub shape_parameter_ids: Vec<ShapeParameterId>,
}

#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DynamicShapeParametersDescriptor {
  pub shape_parameter_ids: Vec<ShapeParameterId>,
}
////////////////////////////////////////////////////////////////////////////////
#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
pub enum ParameterShapeDescriptor {
  ProviderInField(ProviderInField),
  ProviderInShape(ProviderInShape),
}
#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProviderInField {}

#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProviderInShape {
  pub shape_id: ShapeId,
  pub provider_descriptor: ProviderDescriptor,
  pub consuming_parameter_id: ShapeParameterId,
}
////////////////////////////////////////////////////////////////////////////////
#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
pub enum ProviderDescriptor {
  ParameterProvider(ParameterProvider),
  ShapeProvider(ShapeProvider),
  NoProvider(NoProvider),
}

impl Default for ProviderDescriptor {
  fn default() -> Self {
    ProviderDescriptor::NoProvider(NoProvider {})
  }
}

#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ParameterProvider {}

#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapeProvider {
  pub shape_id: ShapeId,
}

#[derive(Debug, Deserialize, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct NoProvider {}
////////////////////////////////////////////////////////////////////////////////

#[derive(Clone, Debug, Serialize)]
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

  pub fn get_parameter_descriptor(&self) -> Option<ShapeKindParameterDescriptor> {
    match self {
      Self::ListKind => Some(ShapeKindParameterDescriptor {
        shape_parameter_id: "$listItem",
      }),
      Self::NullableKind => Some(ShapeKindParameterDescriptor {
        shape_parameter_id: "$nullableInner",
      }),
      Self::OptionalKind => Some(ShapeKindParameterDescriptor {
        shape_parameter_id: "$optionalInner",
      }),
      _ => None,
    }
  }
}
pub struct ShapeKindParameterDescriptor {
  pub shape_parameter_id: &'static str,
}
pub struct ShapeKindDescriptor {
  pub base_shape_id: &'static str,
  pub name: &'static str,
}
