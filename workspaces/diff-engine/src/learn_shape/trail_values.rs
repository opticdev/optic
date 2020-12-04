use crate::{HttpInteraction, BodyDescriptor};
use std::collections::HashMap;
use crate::shapes::{JsonTrail, traverser};
use crate::learn_shape::TrailValues;
use serde_json::json;
use serde_json::Value as JsonValue;
use crate::shapehash;
use std::collections::hash_map::RandomState;
use crate::queries::shape::ShapeQueries;
use crate::learn_shape::json_traverser::JsonTraverser;

type TrailValueMap = HashMap<JsonTrail, TrailValues>;

fn for_body_descriptor(body: Option<BodyDescriptor>) -> HashMap<JsonTrail, TrailValues> {
  let trail_map: HashMap<JsonTrail, TrailValues> = HashMap::new();

  if body.is_some() {
    let traverser = JsonTraverser::new(JsonTrail::empty());

    traverser.traverse_root_shape(
      body,
      &mut JsonTraverser::new(JsonTrail::empty()));
    // let shape_traverser = traverser::Traverser::new();
    HashMap::new()
  } else {
    HashMap::new()
  }
}

#[test]
fn trail_values_should_produce_map() {
  let object_body = json!(
    [{"message": "hello"}, {"message": 123}, {"colors": ["red", true]}]
  );

  let body: Option<BodyDescriptor> = Some(BodyDescriptor::from(object_body));


  let a = for_body_descriptor(body);

}
