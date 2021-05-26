use super::visitors::{
  BodyArrayVisitor, BodyObjectKeyVisitor, BodyObjectVisitor, BodyPrimitiveVisitor, BodyVisitors,
};
use crate::queries::shape::{ChoiceOutput, ShapeQueries};
use crate::state::body::BodyDescriptor;
use crate::state::shape::{FieldId, ShapeId, ShapeKind, ShapeParameterId};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;
use std::fmt;
use std::hash::{Hash, Hasher};
use std::{cmp::Ordering, fmt::Write};

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
                      parent_object_shape_id: choice.shape_id.clone(),
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

#[derive(Debug, Deserialize, Serialize, Clone, Hash)]
pub enum ShapeTrailPathComponent {
  #[serde(rename_all = "camelCase")]
  ObjectTrail { shape_id: ShapeId },
  #[serde(rename_all = "camelCase")]
  ObjectFieldTrail {
    field_id: FieldId,
    field_shape_id: ShapeId,
    parent_object_shape_id: ShapeId,
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

#[derive(Debug, Deserialize, Serialize, Clone, Hash)]
#[serde(rename_all = "camelCase")]
pub struct ShapeTrail {
  pub root_shape_id: ShapeId,
  pub path: Vec<ShapeTrailPathComponent>,
}
impl ShapeTrail {
  pub(crate) fn new(root_shape_id: ShapeId) -> Self {
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

#[derive(Debug, Deserialize, Serialize, Clone, Hash, Eq, PartialEq, Ord, PartialOrd)]
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

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct JsonTrail {
  path: Vec<JsonTrailPathComponent>,
}
impl JsonTrail {
  pub fn empty() -> Self {
    JsonTrail { path: vec![] }
  }
  pub fn with_component(&self, component: JsonTrailPathComponent) -> Self {
    let mut new_trail = self.clone();
    new_trail.path.push(component);
    new_trail
  }

  pub fn with_array(&self) -> Self {
    self.with_component(JsonTrailPathComponent::JsonArray {})
  }

  pub fn with_array_item(&self, index: u32) -> Self {
    self.with_component(JsonTrailPathComponent::JsonArrayItem { index })
  }

  pub fn with_object(&self) -> Self {
    self.with_component(JsonTrailPathComponent::JsonObject {})
  }

  pub fn with_object_key(&self, key: String) -> Self {
    self.with_component(JsonTrailPathComponent::JsonObjectKey { key })
  }

  pub fn normalized(&self) -> Self {
    Self {
      path: self
        .path
        .iter()
        .map(|component| match component {
          JsonTrailPathComponent::JsonArrayItem { index } => {
            JsonTrailPathComponent::JsonArrayItem { index: 0 }
          }
          _ => component.clone(),
        })
        .collect(),
    }
  }

  pub fn pop(&mut self) -> Option<JsonTrailPathComponent> {
    self.path.pop()
  }

  pub fn is_descendant_of(&self, ancestor_trail: &JsonTrail) -> bool {
    self.path.len() > ancestor_trail.path.len()
      && self
        .path
        .iter()
        .take(ancestor_trail.path.len())
        .eq(ancestor_trail.path.iter())
  }

  pub fn is_child_of(&self, parent_trail: &JsonTrail) -> bool {
    self.path.len() == (parent_trail.path.len() + 1) && self.is_descendant_of(parent_trail)
  }

  pub fn last_component(&self) -> Option<&JsonTrailPathComponent> {
    self.path.last()
  }
}

impl PartialEq for JsonTrail {
  fn eq(&self, other: &Self) -> bool {
    self.path == other.path
  }
}

impl Eq for JsonTrail {}

impl Ord for JsonTrail {
  fn cmp(&self, other: &Self) -> Ordering {
    self.path.cmp(&other.path)
  }
}

impl PartialOrd for JsonTrail {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    Some(self.cmp(other))
  }
}

impl Hash for JsonTrail {
  fn hash<H: Hasher>(&self, hash_state: &mut H) {
    self.path.hash(hash_state);
  }
}

impl fmt::Display for JsonTrail {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    let identifiers = self
      .path
      .iter()
      .filter_map(|component| match component {
        JsonTrailPathComponent::JsonArrayItem { index } => Some(format!("{}", index)),
        JsonTrailPathComponent::JsonObjectKey { key } => Some(key.clone()),
        JsonTrailPathComponent::JsonArray {} => None,
        JsonTrailPathComponent::JsonObject {} => None,
      })
      .collect::<Vec<_>>();
    write!(f, "{}", identifiers.join("."))
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use insta::assert_json_snapshot;

  #[test]
  pub fn json_trails_order_root_to_leaf() {
    let mut trails = vec![
      JsonTrail::empty()
        .with_component(JsonTrailPathComponent::JsonObject {})
        .with_component(JsonTrailPathComponent::JsonObjectKey {
          key: String::from("a"),
        })
        .with_component(JsonTrailPathComponent::JsonArray {})
        .with_component(JsonTrailPathComponent::JsonArrayItem { index: 0 }),
      JsonTrail::empty()
        .with_component(JsonTrailPathComponent::JsonObject {})
        .with_component(JsonTrailPathComponent::JsonObjectKey {
          key: String::from("b"),
        }),
      JsonTrail::empty()
        .with_component(JsonTrailPathComponent::JsonObject {})
        .with_component(JsonTrailPathComponent::JsonObjectKey {
          key: String::from("b"),
        })
        .with_component(JsonTrailPathComponent::JsonObject {})
        .with_component(JsonTrailPathComponent::JsonObjectKey {
          key: String::from("foo"),
        }),
      JsonTrail::empty()
        .with_component(JsonTrailPathComponent::JsonObject {})
        .with_component(JsonTrailPathComponent::JsonObjectKey {
          key: String::from("a"),
        }),
      JsonTrail::empty().with_component(JsonTrailPathComponent::JsonObject {}),
      JsonTrail::empty()
        .with_component(JsonTrailPathComponent::JsonObject {})
        .with_component(JsonTrailPathComponent::JsonObjectKey {
          key: String::from("a"),
        })
        .with_component(JsonTrailPathComponent::JsonArray {}),
    ];

    trails.sort();

    assert_json_snapshot!("json_trails_order_root_to_leaf__sorted", trails);
  }

  #[test]
  pub fn json_trails_is_descendant_of() {
    let root_trail = JsonTrail::empty().with_object_key(String::from("a"));
    let child_trail = JsonTrail::empty()
      .with_object_key(String::from("a"))
      .with_object_key(String::from("aa"));
    let other_child_trail = JsonTrail::empty()
      .with_object_key(String::from("c"))
      .with_object_key(String::from("aa"));

    let array_trail = JsonTrail::empty().with_array_item(0);
    let object_in_array_trail = JsonTrail::empty()
      .with_array_item(0)
      .with_object_key(String::from("a"));
    let object_in_other_array_trail = JsonTrail::empty()
      .with_array_item(1)
      .with_object_key(String::from("a"));

    let descendant_trail = JsonTrail::empty()
      .with_object_key(String::from("a"))
      .with_object_key(String::from("aa"))
      .with_object_key(String::from("aaa"));
    let descendant_array_trail = JsonTrail::empty()
      .with_array_item(0)
      .with_object_key(String::from("a"))
      .with_object_key(String::from("aa"));

    assert!(child_trail.is_descendant_of(&root_trail));
    assert!(!root_trail.is_descendant_of(&child_trail));
    assert!(!root_trail.is_descendant_of(&root_trail));
    assert!(!other_child_trail.is_descendant_of(&root_trail));
    assert!(object_in_array_trail.is_descendant_of(&array_trail));
    assert!(!object_in_other_array_trail.is_descendant_of(&array_trail));
    assert!(descendant_trail.is_descendant_of(&root_trail));
    assert!(descendant_array_trail.is_descendant_of(&array_trail));
  }

  #[test]
  pub fn json_trails_is_child_of() {
    let root_trail = JsonTrail::empty().with_object_key(String::from("a"));
    let child_trail = JsonTrail::empty()
      .with_object_key(String::from("a"))
      .with_object_key(String::from("aa"));
    let other_child_trail = JsonTrail::empty()
      .with_object_key(String::from("c"))
      .with_object_key(String::from("aa"));

    let array_trail = JsonTrail::empty().with_array_item(0);
    let object_in_array_trail = JsonTrail::empty()
      .with_array_item(0)
      .with_object_key(String::from("a"));
    let object_in_other_array_trail = JsonTrail::empty()
      .with_array_item(1)
      .with_object_key(String::from("a"));

    let descendant_trail = JsonTrail::empty()
      .with_object_key(String::from("a"))
      .with_object_key(String::from("aa"))
      .with_object_key(String::from("aaa"));
    let descendant_array_trail = JsonTrail::empty()
      .with_array_item(0)
      .with_object_key(String::from("a"))
      .with_object_key(String::from("aa"));

    assert!(child_trail.is_child_of(&root_trail));
    assert!(!root_trail.is_child_of(&child_trail));
    assert!(!root_trail.is_child_of(&root_trail));
    assert!(!other_child_trail.is_child_of(&root_trail));
    assert!(object_in_array_trail.is_child_of(&array_trail));
    assert!(!object_in_other_array_trail.is_child_of(&array_trail));
    assert!(!descendant_trail.is_child_of(&root_trail));
    assert!(!descendant_array_trail.is_child_of(&array_trail));
  }
}
