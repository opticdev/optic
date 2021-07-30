use crate::commands::ShapeCommand;
use crate::projections::ShapeProjection;
use crate::queries::ShapeQueries;
use crate::shapes::ShapeTrail;
use crate::state::shape::{FieldId, ShapeId, ShapeKind};
use serde::Serialize;
use std::collections::BTreeSet;

#[derive(Debug, Serialize, Clone, Eq, PartialEq, Ord, PartialOrd)]
pub enum JsonType {
  String,
  Number,
  Boolean,
  Array,
  Object,
  Null,
  Undefined,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PrimitiveChoice {
  shape_id: ShapeId,
  json_type: JsonType,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ObjectFieldChoice {
  name: String,
  field_id: FieldId,
  shape_id: ShapeId,
  is_removed: bool,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ObjectChoice {
  shape_id: ShapeId,
  json_type: JsonType,
  fields: Vec<ObjectFieldChoice>,
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ArrayChoice {
  json_type: JsonType,
  shape_id: ShapeId,
  item_shape_id: ShapeId,
}

#[derive(Debug, Serialize, Clone)]
#[serde(tag = "type")]
pub enum ShapeChoice {
  Primitive(PrimitiveChoice),
  Object(ObjectChoice),
  Array(ArrayChoice),
  Any,
  Unknown,
}

impl ShapeChoice {
  fn json_type(&self) -> Option<&JsonType> {
    match self {
      ShapeChoice::Primitive(choice) => Some(&choice.json_type),
      ShapeChoice::Object(choice) => Some(&choice.json_type),
      ShapeChoice::Array(choice) => Some(&choice.json_type),
      ShapeChoice::Any => None,
      ShapeChoice::Unknown => None,
    }
  }
}

pub struct ShapeChoiceQueries<'a> {
  shape_queries: ShapeQueries<'a>,
  shape_projection: &'a ShapeProjection,
}

impl<'a> From<&'a ShapeProjection> for ShapeChoiceQueries<'a> {
  fn from(shape_projection: &'a ShapeProjection) -> Self {
    let shape_queries = ShapeQueries::new(shape_projection);

    Self {
      shape_queries,
      shape_projection,
    }
  }
}

impl<'a> ShapeChoiceQueries<'a> {
  pub fn trail_choices(
    &'a self,
    shape_trail: &ShapeTrail,
  ) -> impl Iterator<Item = ShapeChoice> + 'a {
    let trail_choices = self.shape_queries.list_trail_choices(&shape_trail);
    let queries = &self.shape_queries;

    trail_choices
      .into_iter()
      .map(move |choice| match choice.core_shape_kind {
        ShapeKind::ObjectKind => {
          let object_fields = queries.resolve_shape_fields_nodes(&choice.shape_id, true);
          let fields = object_fields
            .map(|field_node| {
              let field_shape_id = queries
                .resolve_field_shape_node(&field_node.field_id)
                .expect("expected field shape to resolve");

              ObjectFieldChoice {
                field_id: field_node.field_id.clone(),
                shape_id: field_shape_id,
                name: field_node.descriptor.name.clone(),
                is_removed: field_node.is_removed,
              }
            })
            .collect();

          let output = ObjectChoice {
            shape_id: choice.shape_id.clone(),
            json_type: JsonType::Object,
            fields,
          };
          ShapeChoice::Object(output)
        }
        ShapeKind::ListKind => {
          let shape_parameter_id = &String::from(
            choice
              .core_shape_kind
              .get_parameter_descriptor()
              .expect("expected $list to have a parameter descriptor")
              .shape_parameter_id,
          );
          let list_item_shape_id =
            queries.resolve_parameter_to_shape(&choice.shape_id, shape_parameter_id);
          let output = ArrayChoice {
            shape_id: choice.shape_id.clone(),
            json_type: JsonType::Array,
            item_shape_id: list_item_shape_id,
          };
          ShapeChoice::Array(output)
        }
        ShapeKind::MapKind => unimplemented!(),
        ShapeKind::OneOfKind => unreachable!(),
        ShapeKind::AnyKind => ShapeChoice::Any,
        ShapeKind::UnknownKind => ShapeChoice::Unknown,
        ShapeKind::StringKind => ShapeChoice::Primitive(PrimitiveChoice {
          shape_id: choice.shape_id.clone(),
          json_type: JsonType::String,
        }),
        ShapeKind::NumberKind => ShapeChoice::Primitive(PrimitiveChoice {
          shape_id: choice.shape_id.clone(),
          json_type: JsonType::Number,
        }),
        ShapeKind::BooleanKind => ShapeChoice::Primitive(PrimitiveChoice {
          shape_id: choice.shape_id.clone(),
          json_type: JsonType::Boolean,
        }),
        ShapeKind::NullableKind => ShapeChoice::Primitive(PrimitiveChoice {
          shape_id: choice.shape_id.clone(),
          json_type: JsonType::Null,
        }),
        ShapeKind::IdentifierKind => unimplemented!(),
        ShapeKind::ReferenceKind => unimplemented!(),
        ShapeKind::OptionalKind => ShapeChoice::Primitive(PrimitiveChoice {
          shape_id: choice.shape_id.clone(),
          json_type: JsonType::Undefined,
        }),
      })
  }
}
