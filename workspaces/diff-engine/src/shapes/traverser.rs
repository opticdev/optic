use super::visitors::{
  BodyArrayVisitor, BodyObjectKeyVisitor, BodyObjectVisitor, BodyPrimitiveVisitor, BodyVisitors,
};
use crate::queries::shape::{ChoiceOutput, ShapeQueries};
use crate::state::body::BodyDescriptor;
use crate::state::shape::{FieldId, ShapeId, ShapeKind, ShapeParameterId};
use serde::Serialize;
use serde_json::Value as JsonValue;
use std::hash::{Hash, Hasher};

pub struct Traverser<'a> {
  shape_queries: &'a ShapeQueries<'a>,
}

impl<'a> Traverser<'a> {
  pub fn new(shape_queries: &'a ShapeQueries) -> Self {
    Traverser { shape_queries }
  }

  pub fn traverse_root_shape<R>(
    &self,
    body_option: Option<BodyDescriptor>,
    shape_id: &ShapeId,
    visitors: &mut impl BodyVisitors<R>,
  ) {
    let body_trail = JsonTrail::empty();
    let trail_origin = ShapeTrail::new(shape_id.clone());
    let choices: Vec<ChoiceOutput> = self.shape_queries.list_trail_choices(&trail_origin);
    self.traverse(body_option, body_trail, trail_origin, &choices, visitors)
  }

  pub fn traverse<R>(
    &self,
    body_option: Option<BodyDescriptor>,
    body_trail: JsonTrail,
    trail_origin: ShapeTrail,
    trail_choices: &Vec<ChoiceOutput>,
    visitors: &mut impl BodyVisitors<R>,
  ) {
    // eprintln!("shape-traverser: traversing body");
    if let None = body_option {
      // eprintln!("shape-traverser: no body available");
      return;
    }

    // eprintln!("shape-traverser: body found");
    let body = body_option.unwrap();

    match body {
      BodyDescriptor::Array(_) => {
        // eprintln!("shape-traverser: visiting array");
        let array_visitor = visitors.array();
        let matching_choices =
          array_visitor.visit(&body, &body_trail, &trail_origin, trail_choices);
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

        let items = match body {
          BodyDescriptor::Array(items) => items,
          _ => unreachable!("expect body to be an array"),
        };

        items.into_unique().for_each(|(item, indexes)| {
          let item_json_trail = body_trail.with_component(JsonTrailPathComponent::JsonArrayItem {
            index: *(indexes.first().unwrap()) as u32,
          });

          let new_trail_origin = match item_choices.first() {
            Some(choice) => choice.parent_trail.clone(),
            None => trail_origin.clone(),
          };

          if !item_choices.is_empty() {
            self.traverse(
              Some(item),
              item_json_trail,
              new_trail_origin,
              &item_choices,
              visitors,
            )
          }
        });
      }
      BodyDescriptor::Object(_) => {
        // eprintln!("shape-traverser: visiting object");
        let matching_choices = {
          let object_visitor = visitors.object();
          object_visitor.visit(&body, &body_trail, &trail_origin, trail_choices)
        };
        // eprintln!("shape-traverser: visiting object keys");
        let object_key_visitor = visitors.object_key();

        let object = match body {
          BodyDescriptor::Object(fields) => fields,
          _ => unreachable!("expect body to be an object"),
        };

        let object_key_choices = matching_choices
          .iter()
          .map(|choice| {
            if let ShapeKind::ObjectKind = &choice.core_shape_kind {
              // - find field node by key in object's field node edges
              let field_ids = self
                .shape_queries
                .resolve_shape_field_id_and_names(&choice.shape_id);

              (
                choice,
                field_ids
                  .map(|(field_id, field_name)| {
                    let field_shape_id = self
                      .shape_queries
                      .resolve_field_shape_node(&field_id)
                      .unwrap();
                    let field_core_shape_kind =
                      self.shape_queries.resolve_to_core_shape(&field_shape_id);
                    (
                      field_name.clone(),
                      field_id.clone(),
                      field_shape_id.clone(),
                      field_core_shape_kind,
                    )
                  })
                  .collect::<Vec<_>>(),
              )
            } else {
              unreachable!("should only contain choices of object kind");
            }
          })
          .collect::<Vec<_>>();

        let object_keys = object.keys().map(|x| (*x).clone()).collect::<Vec<_>>();
        object_key_visitor.visit(&body_trail, &object_keys, &object_key_choices);

        object.entries().for_each(|(field_key, field_body)| {
          let field_json_trail = body_trail.with_component(JsonTrailPathComponent::JsonObjectKey {
            key: field_key.clone(),
          });

          let field_choices = matching_choices
            .iter()
            .flat_map(|choice| {
              //dbg!("shape-traverser: object choice", choice);
              if let ShapeKind::ObjectKind = &choice.core_shape_kind {
                // - find field node by key in object's field node edges
                let field_id_option = self
                  .shape_queries
                  .resolve_field_id(&choice.shape_id, &field_key);
                if let None = field_id_option {
                  //dbg!("shape-traverser: no field id could be resolved");
                  return vec![];
                }

                let field_id = field_id_option.unwrap();
                let field_shape_id = self
                  .shape_queries
                  .resolve_field_shape_node(&field_id)
                  .expect("field node should have an edge to a shape node describing its value");
                //dbg!("shape-traverser: field_shape_id", &field_shape_id);

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
          let new_trail_origin = match field_choices.first() {
            Some(choice) => choice.parent_trail.clone(),
            None => trail_origin.clone(),
          };
          //dbg!(&new_trail_origin);

          if !matching_choices.is_empty() {
            self.traverse(
              Some(field_body),
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
        // eprintln!("shape-traverser: visiting primitive");
        primitive_visitor.visit(primitive_value, body_trail, trail_origin, trail_choices);
      }
    }
  }
}

#[derive(Debug, Serialize, Clone, Hash)]
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

#[derive(Debug, Serialize, Clone, Hash)]
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

  pub fn with_component(&self, component: ShapeTrailPathComponent) -> Self {
    let mut new_trail = self.clone();
    new_trail.path.push(component);
    new_trail
  }
}

#[derive(Debug, Serialize, Clone, Hash)]
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
  pub(crate) fn empty() -> Self {
    JsonTrail { path: vec![] }
  }
  pub fn with_component(&self, component: JsonTrailPathComponent) -> Self {
    let mut new_trail = self.clone();
    new_trail.path.push(component);
    new_trail
  }
}

impl Hash for JsonTrail {
  fn hash<H: Hasher>(&self, hash_state: &mut H) {
    let components = self
      .path
      .clone()
      .into_iter()
      .map(|component| match component {
        JsonTrailPathComponent::JsonArrayItem { index } => {
          JsonTrailPathComponent::JsonArrayItem { index: 0 }
        }
        _ => component,
      })
      .collect::<Vec<_>>();

    components.hash(hash_state);
  }
}
