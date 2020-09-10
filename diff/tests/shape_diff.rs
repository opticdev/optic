use insta::assert_debug_snapshot;
use optic_diff::{diff_shape, ShapeProjection, SpecEvent};
use serde_json::json;

#[test]
fn can_match_primitive_json() {
  let events: Vec<SpecEvent> = serde_json::from_value(
    json!([
    {"ShapeAdded":{"shapeId":"example_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}}
  ]),
  ).expect("should be able to deserialize shape added events as spec events");
  let shape_projection = ShapeProjection::from(events);

  let string_body = json!("a-string");
  let shape_id = String::from("example_shape_1");

  let results = diff_shape(&shape_projection, Some(string_body), &shape_id);

  assert_eq!(
    results.len(),
    0,
    "matching body with matching base shape should not yield any results"
  );
}

#[test]
fn can_diff_primitive_json_and_yield_unmatched_shape() {
  let events: Vec<SpecEvent> = serde_json::from_value(
    json!([
    {"ShapeAdded":{"shapeId":"example_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}}
  ]),
  ).expect("should be able to deserialize shape added events as spec events");
  let shape_projection = ShapeProjection::from(events);

  let number_body = json!(36);
  let shape_id = String::from("example_shape_1");
  let results = diff_shape(&shape_projection, Some(number_body), &shape_id);

  assert_eq!(results.len(), 1);
  assert_debug_snapshot!(results);
}

#[test]
fn can_diff_primitive_json_and_yield_unspecified_shape() {
  let events: Vec<SpecEvent> = serde_json::from_value(
    json!([
    {"ShapeAdded":{"shapeId":"example_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}}
  ]),
  ).expect("should be able to deserialize shape added events as spec events");
  let shape_projection = ShapeProjection::from(events);

  let string_body = json!("a-string");
  let unknown_shape_id = String::from("not-a-shape-id");
  // TODO: consider returning a Result with Err instead of panicking
  let results = diff_shape(&shape_projection, Some(string_body), &unknown_shape_id);
  assert_eq!(results.len(), 1);
  assert_debug_snapshot!(results);
}

#[test]
fn can_match_array_json() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"list_1","baseShapeId":"$list","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}}
    ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);

  let array_body = json!([4, 6, 8, 10]);
  let shape_id = String::from("list_1");
  let results = diff_shape(&shape_projection, Some(array_body), &shape_id);

  assert_debug_snapshot!(results);
  assert_eq!(results.len(), 0);
}

#[test]
fn can_yield_unmatched_shape_for_array_body() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}}
    ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);

  let array_body = json!([3, 9, 12, 15]);
  let shape_id = String::from("shape_1");
  let results = diff_shape(&shape_projection, Some(array_body), &shape_id);

  assert_debug_snapshot!(results);
  assert_eq!(results.len(), 1);
}
