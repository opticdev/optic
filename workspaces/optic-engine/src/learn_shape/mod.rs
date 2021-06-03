use crate::shapes::JsonTrail;
use crate::BodyDescriptor;
use crate::HttpInteraction;
use std::collections::HashMap;

mod result;
mod traverser;
mod visitors;

pub use result::{TrailObservationsResult, TrailValues};
use traverser::Traverser;
use visitors::learn_json_values::LearnVisitors;
use visitors::BodyVisitors;

/// Traverse the description of a body and denote, per body trail, the types
/// of values seen.
pub fn observe_body_trails(
  into_body: impl Into<Option<BodyDescriptor>>,
) -> TrailObservationsResult {
  let body = into_body.into();
  let trail_map: HashMap<JsonTrail, TrailValues> = HashMap::new();

  let values_by_trail = if body.is_some() {
    let traverser = Traverser::new();
    let mut visitors = LearnVisitors::new();

    traverser.traverse_root_shape(body, &mut visitors);
    visitors.take_results()
  } else {
    HashMap::new()
  };

  TrailObservationsResult::from(values_by_trail)
}

#[cfg(test)]
mod test {
  use super::*;
  use insta::assert_debug_snapshot;
  use serde_json::json;

  #[test]
  fn trail_values_should_produce_magp() {
    let object_body = json!(
      [{"message": "hello"}, {"message": 123}, {"colors": ["red", true]}]
    );

    let body: Option<BodyDescriptor> = Some(BodyDescriptor::from(object_body));

    let result = observe_body_trails(body).normalized();

    let root_shape_trail = JsonTrail::empty();
    let root_shape_result = result
      .values()
      .find(|value| value.trail == root_shape_trail)
      .expect("results should contain a json trail for the root shape");
    assert!(root_shape_result.was_array);

    let item_trail = JsonTrail::empty().with_array_item(0);
    let item_shape_result = result
      .values()
      .find(|value| value.trail == item_trail)
      .expect("results should contain a json trail for the array item");
    dbg!(&item_shape_result);
    assert!(item_shape_result.was_object);
    assert_eq!(item_shape_result.field_sets.len(), 2);
  }
}
