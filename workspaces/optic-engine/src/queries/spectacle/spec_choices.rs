use crate::commands::ShapeCommand;
use crate::projections::ShapeProjection;
use crate::queries::ShapeQueries;
use crate::shapes::ShapeTrail;
use crate::state::shape::{FieldId, ShapeId, ShapeKind};
use crate::state::SpecIdGenerator;
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
          let object_fields = queries.resolve_shape_field_id_and_names(&choice.shape_id);
          let fields = object_fields
            .map(|(field_id, name)| {
              let field_shape_id = queries
                .resolve_field_shape_node(field_id)
                .expect("expected field shape to resolve");

              ObjectFieldChoice {
                field_id: field_id.clone(),
                shape_id: field_shape_id,
                name: name.clone(),
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

  pub fn edit_field_commands(
    &'a self,
    field_id: &FieldId,
    requested_json_types: impl IntoIterator<Item = &'a JsonType> + 'a,
    id_generator: &'a mut impl SpecIdGenerator,
  ) -> Option<impl Iterator<Item = ShapeCommand> + 'a> {
    let field_shape_trail = self.shape_queries.resolve_shape_trail(field_id)?;

    dbg!(&field_shape_trail);

    let requested_kinds =
      requested_json_types
        .into_iter()
        .filter_map(|json_type| match json_type {
          JsonType::Undefined => Some(&ShapeKind::OptionalKind),
          JsonType::Null => Some(&ShapeKind::NullableKind),
          _ => None,
        });

    self
      .shape_queries
      .edit_shape_trail_commands(&field_shape_trail, requested_kinds, id_generator)
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use crate::commands::SpecCommand;
  use crate::events::SpecEvent;
  use crate::projections::SpecProjection;
  use crate::Aggregate;
  use insta::assert_debug_snapshot;
  use serde_json::json;

  #[test]
  pub fn can_generate_edit_field_commands() {
    let events: Vec<SpecEvent> = serde_json::from_value(json!([
      { "ShapeAdded": { "shapeId": "string_shape_1", "baseShapeId": "$string", "name": "", "eventContext": null }},
      { "ShapeAdded": { "shapeId": "object_shape_1", "baseShapeId": "$object", "name": "", "eventContext": null }},
      { "FieldAdded": { "fieldId": "field_1", "shapeId": "object_shape_1", "name": "lastName", "shapeDescriptor": { "FieldShapeFromShape": { "fieldId": "field_1", "shapeId": "string_shape_1"}}, "eventContext": null }},
    ]))
    .expect("should be able to deserialize test events");

    let spec_projection = SpecProjection::from(events);
    let queries = ShapeChoiceQueries::from(spec_projection.shape());

    let mut id_generator = SequentialIdGenerator { next_id: 1093 }; // <3 primes
    let required_json_types = vec![JsonType::Undefined, JsonType::Null];

    let edit_shape_commands = queries
      .edit_field_commands(
        &"field_1".to_owned(),
        &required_json_types,
        &mut id_generator,
      )
      .expect("field should be able to be made required and nullable")
      .map(SpecCommand::from)
      .collect::<Vec<_>>();

    assert_debug_snapshot!(
      "can_generate_edit_field_commands__commands",
      &edit_shape_commands
    );

    let updated_spec = assert_valid_commands(spec_projection.clone(), edit_shape_commands);
    let updated_queries = ShapeChoiceQueries::from(updated_spec.shape());
    let updated_choices = updated_queries
      .trail_choices(&ShapeTrail::new("object_shape_1".to_owned()))
      .collect::<Vec<_>>();

    assert_debug_snapshot!(
      "can_generate_edit_field_commands__updated_choices",
      updated_choices
    );
  }

  fn assert_valid_commands(
    mut spec_projection: SpecProjection,
    commands: impl IntoIterator<Item = SpecCommand>,
  ) -> SpecProjection {
    // let mut spec_projection = SpecProjection::default();
    for command in commands {
      let events = spec_projection
        .execute(command)
        .expect("generated commands must be valid");

      for event in events {
        spec_projection.apply(event)
      }
    }

    spec_projection
  }

  #[derive(Debug, Default)]
  struct SequentialIdGenerator {
    next_id: u32,
  }
  impl SpecIdGenerator for SequentialIdGenerator {
    fn generate_id(&mut self, prefix: &str) -> String {
      self.next_id += 1;
      format!("{}{}", prefix, self.next_id.to_string())
    }
  }
}
