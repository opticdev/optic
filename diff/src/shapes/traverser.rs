use super::visitors::{
  JlasArrayVisitor, JlasObjectVisitor, JlasPrimitiveVisitor, JsonBodyVisitors,
};
use crate::queries::shape::{ChoiceOutput, ShapeQueries};
use crate::state::shape::{FieldId, ShapeId, ShapeKind, ShapeParameterId};
use serde::Serialize;
use serde_json::Value as JsonValue;

pub struct Traverser<'a> {
  shape_queries: &'a ShapeQueries<'a>,
}

impl<'a> Traverser<'a> {
  pub fn new(shape_queries: &'a ShapeQueries) -> Self {
    Traverser { shape_queries }
  }

  pub fn traverse_root_shape<R>(
    &self,
    json_body_option: Option<JsonValue>,
    shape_id: &ShapeId,
    visitors: &mut impl JsonBodyVisitors<R>,
  ) {
    let body_trail = JsonTrail::empty();
    let trail_origin = ShapeTrail::new(shape_id.clone());
    let choices: Vec<ChoiceOutput> = self.shape_queries.list_trail_choices(&trail_origin);
    self.traverse(
      json_body_option,
      body_trail,
      trail_origin,
      &choices,
      visitors,
    )
  }

  pub fn traverse<R>(
    &self,
    json_body_option: Option<JsonValue>,
    body_trail: JsonTrail,
    trail_origin: ShapeTrail,
    trail_choices: &Vec<ChoiceOutput>,
    visitors: &mut impl JsonBodyVisitors<R>,
  ) {
    if let None = json_body_option {
      return;
    }

    let json_body = json_body_option.unwrap();

    match json_body {
      JsonValue::Array(_) => {
        let array_visitor = visitors.array();
        let matching_choices =
          array_visitor.visit(&json_body, &body_trail, &trail_origin, trail_choices);
        let item_choices = matching_choices
          .iter()
          .flat_map(move |choice| {
            if let ShapeKind::ListKind = &choice.core_shape_kind {
              let item_shape_id = self.shape_queries.resolve_parameter_to_shape(
                &choice.shape_id,
                &String::from(
                  choice
                    .core_shape_kind
                    .get_parameter_descriptor()
                    .unwrap()
                    .shape_parameter_id,
                ),
              );
              let item_trail =
                choice
                  .shape_trail()
                  .with_component(ShapeTrailPathComponent::ListItemTrail {
                    list_shape_id: choice.shape_id.clone(),
                    item_shape_id: item_shape_id,
                  });
              self.shape_queries.list_trail_choices(&item_trail)
            } else {
              unreachable!("should only contain items of list kind");
            }
          })
          .collect::<Vec<_>>();
        let items = match json_body {
          JsonValue::Array(items) => items,
          _ => unreachable!("expect json body to be an array"),
        };
        items
          .into_iter()
          .enumerate()
          .for_each(|(index, item_json)| {
            let item_json_trail =
              body_trail.with_component(JsonTrailPathComponent::JsonArrayItem {
                index: index as u32,
              });

            let new_trail_origin = trail_origin.clone();

            if !item_choices.is_empty() {
              self.traverse(
                Some(item_json),
                item_json_trail,
                new_trail_origin,
                &item_choices,
                visitors,
              )
            }
          });
      }
      JsonValue::Object(_) => {
        let object_visitor = visitors.object();
        let matching_choices =
          object_visitor.visit(&json_body, &body_trail, &trail_origin, trail_choices);

        let fields = match json_body {
          JsonValue::Object(fields) => fields,
          _ => unreachable!("expect json body to be an object"),
        };
        fields.into_iter().for_each(|(field_key, field_json)| {
          let field_json_trail = body_trail.with_component(JsonTrailPathComponent::JsonObjectKey {
            key: field_key.clone(),
          });

          let field_choices = matching_choices
            .iter()
            .flat_map(|choice| {
              // eprintln!("object choice {:?}", choice);
              if let ShapeKind::ObjectKind = &choice.core_shape_kind {
                // - find field node by key in object's field node edges
                let field_id_option = self
                  .shape_queries
                  .resolve_field_id(&choice.shape_id, &field_key);
                if let None = field_id_option {
                  eprintln!("no field id could be resolved");
                  return vec![];
                }

                let field_id = field_id_option.unwrap();
                let field_shape_id = self
                  .shape_queries
                  .resolve_field_shape_node(&field_id)
                  .expect("field node should have an edge to a shape node describing its value");
                // eprintln!("field_shape_id {:?}", field_shape_id);

                let field_trail =
                  choice
                    .shape_trail()
                    .with_component(ShapeTrailPathComponent::ObjectFieldTrail {
                      field_id: field_id.clone(),
                      field_shape_id: field_shape_id,
                    });
                self.shape_queries.list_trail_choices(&field_trail)
              } else {
                unreachable!("should only contain choices of object kind");
              }
            })
            .collect::<Vec<ChoiceOutput>>();
          let new_trail_origin = trail_origin.clone();

          if !field_choices.is_empty() {
            self.traverse(
              Some(field_json),
              field_json_trail,
              new_trail_origin,
              &field_choices,
              visitors,
            )
          }
        });
      }
      primitive_value => {
        let primitive_visitor = visitors.primitive();
        primitive_visitor.visit(primitive_value, body_trail, trail_origin, trail_choices);
      }
    }
  }
}

#[derive(Debug, Serialize, Clone)]
pub enum ShapeTrailPathComponent {
  #[serde(rename_all = "camelCase")]
  ObjectTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  ObjectFieldTrail {
    field_id: FieldId,
    field_shape_id: ShapeId,
  },
  #[serde(rename_all = "camelCase")]
  ListTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  ListItemTrail {
    list_shape_id: ShapeId,
    item_shape_id: ShapeId,
  },
  #[serde(rename_all = "camelCase")]
  OneOfTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  OneOfItemTrail {
    one_of_id: ShapeId,
    parameter_id: ShapeParameterId,
    item_shape_id: ShapeId,
  },
  #[serde(rename_all = "camelCase")]
  OptionalTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  OptionalItemTrail {
    shape_id: ShapeId,
    inner_shape_id: ShapeId,
  },
  #[serde(rename_all = "camelCase")]
  NullableTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  NullableItemTrail {
    shape_id: ShapeId,
    inner_shape_id: ShapeId,
  },
  #[serde(rename_all = "camelCase")]
  UnknownTrail {},
}

#[derive(Debug, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ShapeTrail {
  pub root_shape_id: ShapeId,
  pub path: Vec<ShapeTrailPathComponent>,
}
impl ShapeTrail {
  fn new(root_shape_id: ShapeId) -> Self {
    ShapeTrail {
      root_shape_id,
      path: vec![],
    }
  }

  fn with_component(&self, component: ShapeTrailPathComponent) -> Self {
    let mut new_trail = self.clone();
    new_trail.path.push(component);
    new_trail
  }
}

#[derive(Debug, Serialize, Clone)]
pub enum JsonTrailPathComponent {
  #[serde(rename_all = "camelCase")]
  JsonObject {},
  #[serde(rename_all = "camelCase")]
  JsonArray {},
  #[serde(rename_all = "camelCase")]
  JsonObjectKey { key: String },
  #[serde(rename_all = "camelCase")]
  JsonArrayItem { index: u32 },
}

#[derive(Debug, Serialize, Clone)]
pub struct JsonTrail {
  path: Vec<JsonTrailPathComponent>,
}
impl JsonTrail {
  fn empty() -> Self {
    JsonTrail { path: vec![] }
  }
  fn with_component(&self, component: JsonTrailPathComponent) -> Self {
    let mut new_trail = self.clone();
    new_trail.path.push(component);
    new_trail
  }
}
#[cfg(test)]
mod test {
  use super::*;

  #[test]
  fn traversing_with_no_paths() {}
}
