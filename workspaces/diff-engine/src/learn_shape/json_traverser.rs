use crate::queries::shape::{ChoiceOutput, ShapeQueries};
use crate::state::body::BodyDescriptor;
use crate::state::shape::{FieldId, ShapeId, ShapeKind, ShapeParameterId};
use serde::Serialize;
use serde_json::Value as JsonValue;
use std::hash::{Hash, Hasher};
use crate::shapes::{JsonTrail, JsonTrailPathComponent};
use crate::learn_shape::visitors::JsonVisitors;

pub struct JsonTraverser {
  trail_focus:  JsonTrail
}

impl JsonTraverser {
  pub fn new(trail_focus: JsonTrail) -> Self {
    JsonTraverser { trail_focus }
  }

  pub fn traverse_root_shape<R>(
    &self,
    body_option: Option<BodyDescriptor>,
    visitors: &mut impl JsonVisitors<R>,
  ) {
    let body_trail = JsonTrail::empty();
    self.traverse(body_option, body_trail, visitors)
  }

  pub fn should_traverse(&self, trail: &JsonTrail) -> bool {
    true //replace with normalization
  }

  pub fn traverse<R>(
    &self,
    body_option: Option<BodyDescriptor>,
    body_trail: JsonTrail,
    visitors: &mut impl JsonVisitors<R>,
  ) {
    if let None = body_option {
      return;
    }

    let body = body_option.unwrap();

    match body {
      BodyDescriptor::Array(_) => {
        // eprintln!("shape-traverser: visiting array");
        let array_visitor = visitors.array();

        let items = match body {
          BodyDescriptor::Array(items) => items,
          _ => unreachable!("expect body to be an array"),
        };

        items.into_unique().for_each(|(item, indexes)| {
          let item_json_trail = body_trail.with_component(JsonTrailPathComponent::JsonArrayItem {
            index: *(indexes.first().unwrap()) as u32,
          });

          self.traverse(
            Some(item),
            item_json_trail,
            visitors,
          )
        });
      }
      BodyDescriptor::Object(_) => {
        // eprintln!("shape-traverser: visiting object keys");
        let object_key_visitor = visitors.object_key();

        let object = match body {
          BodyDescriptor::Object(fields) => fields,
          _ => unreachable!("expect body to be an object"),
        };

        let object_keys = object.keys().map(|x| (*x).clone()).collect::<Vec<_>>();
        object_key_visitor.visit(&body_trail, &object_keys);

        object.entries().for_each(|(field_key, field_body)| {

          let field_json_trail = body_trail.with_component(JsonTrailPathComponent::JsonObjectKey {
            key: field_key.clone(),
          });


          self.traverse(
            Some(field_body),
            field_json_trail,
            visitors,
          )
        });
      }
      primitive_value => {
        let primitive_visitor = visitors.primitive();
        // eprintln!("shape-traverser: visiting primitive");
        primitive_visitor.visit(primitive_value, body_trail);
      }
    }
  }
}
