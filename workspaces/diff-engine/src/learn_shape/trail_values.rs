use crate::learn_shape::traverser::Traverser;
use crate::learn_shape::visitors::learn_json_values::LearnVisitors;
use crate::learn_shape::TrailValues;
use crate::shapes::JsonTrail;
use crate::BodyDescriptor;
use serde_json::json;
use std::collections::HashMap;

type TrailValueMap = HashMap<JsonTrail, TrailValues>;

fn for_body_descriptor(body: Option<BodyDescriptor>) -> HashMap<JsonTrail, TrailValues> {
  let trail_map: HashMap<JsonTrail, TrailValues> = HashMap::new();

  if body.is_some() {
    let traverser = Traverser::new();
    let mut visitors = LearnVisitors::new();

    traverser.traverse_root_shape(body, &mut visitors);
    //
    // traverser.traverse_root_shape(
    //   body,
    //   &mut JsonTraverser::new(JsonTrail::empty()));
    // // let shape_traverser = traverser::Traverser::new();
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
