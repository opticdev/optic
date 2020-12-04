use super::visitors::{
  BodyArrayVisitor, BodyObjectKeyVisitor, BodyObjectVisitor, BodyPrimitiveVisitor, BodyVisitors,
};
use crate::queries::shape::{ChoiceOutput, ShapeQueries};
use crate::shapes::{JsonTrail, JsonTrailPathComponent};
use crate::state::body::BodyDescriptor;
use crate::state::shape::{FieldId, ShapeId, ShapeKind, ShapeParameterId};
use serde::Serialize;
use serde_json::Value as JsonValue;
use std::hash::{Hash, Hasher};

pub struct Traverser {}

impl Traverser {
  pub fn new() -> Self {
    Self {}
  }

  pub fn traverse_root_shape<R>(
    &self,
    body_option: Option<BodyDescriptor>,
    visitors: &mut impl BodyVisitors<R>,
  ) {
    let body_trail = JsonTrail::empty();
    self.traverse(body_option, body_trail, visitors)
  }

  pub fn traverse<R>(
    &self,
    body_option: Option<BodyDescriptor>,
    body_trail: JsonTrail,
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
        array_visitor.visit(&body, &body_trail);

        let items = match body {
          BodyDescriptor::Array(items) => items,
          _ => unreachable!("expect body to be an array"),
        };

        items.into_unique().for_each(|(item, indexes)| {
          let item_json_trail = body_trail.with_component(JsonTrailPathComponent::JsonArrayItem {
            index: *(indexes.first().unwrap()) as u32,
          });

          self.traverse(Some(item), item_json_trail, visitors)
        });
      }
      BodyDescriptor::Object(_) => {
        // eprintln!("shape-traverser: visiting object");
        let object_visitor = visitors.object();
        object_visitor.visit(&body, &body_trail);
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

          self.traverse(Some(field_body), field_json_trail, visitors)
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
