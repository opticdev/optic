use insta::assert_debug_snapshot;
use optic_diff::{diff_shape, ShapeProjection, SpecEvent};
use petgraph::dot::Dot;
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

  assert_debug_snapshot!(
    "can_diff_primitive_json_and_yield_unmatched_shape__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let number_body = json!(36);
  let shape_id = String::from("example_shape_1");
  let results = diff_shape(&shape_projection, Some(number_body), &shape_id);

  assert_eq!(results.len(), 1);
  assert_debug_snapshot!(
    "can_diff_primitive_json_and_yield_unmatched_shape__results",
    results
  );
}

#[test]
#[ignore]
// TODO: fix this test of the PrimitiveVisitor yielding an UnspecifiedShape diff:
// this test needs to provide a scenario where there is an object field in the interaction that is not in the spec
fn can_diff_primitive_json_and_yield_unspecified_shape() {
  let events: Vec<SpecEvent> = serde_json::from_value(
    json!([
    {"ShapeAdded":{"shapeId":"example_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}}
  ]),
  ).expect("should be able to deserialize shape added events as spec events");
  let shape_projection = ShapeProjection::from(events);

  assert_debug_snapshot!(
    "can_diff_primitive_json_and_yield_unspecified_shape__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let string_body = json!("a-string");
  let unknown_shape_id = String::from("not-a-shape-id");
  // TODO: consider returning a Result with Err instead of panicking
  let results = diff_shape(&shape_projection, Some(string_body), &unknown_shape_id);
  assert_eq!(results.len(), 1);
  assert_debug_snapshot!(
    "can_diff_primitive_json_and_yield_unspecified_shape__results",
    results
  );
}

#[test]
fn can_match_array_json() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"list_1","baseShapeId":"$list","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"number_shape_1","baseShapeId":"$number","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"list_1","providerDescriptor":{"ShapeProvider":{"shapeId":"number_shape_1"}},"consumingParameterId":"$listItem"}}}},
      ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);

  assert_debug_snapshot!(
    "can_match_array_json__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let array_body = json!([4, 6, 8, 10]);
  let shape_id = String::from("list_1");
  let results = diff_shape(&shape_projection, Some(array_body), &shape_id);

  assert_debug_snapshot!("can_match_array_json__results", results);
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
  assert_debug_snapshot!(
    "can_yield_unmatched_shape_for_array_body__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );

  let array_body = json!([3, 9, 12, 15]);
  let shape_id = String::from("shape_1");
  let results = diff_shape(&shape_projection, Some(array_body), &shape_id);

  assert_debug_snapshot!("can_yield_unmatched_shape_for_array_body__results", results);
  assert_eq!(results.len(), 1);
}

#[test]
fn can_yield_unmatched_shape_for_mismatched_array_items() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"list_1","baseShapeId":"$list","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"number_shape_1","baseShapeId":"$number","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"list_1","providerDescriptor":{"ShapeProvider":{"shapeId":"number_shape_1"}},"consumingParameterId":"$listItem"}}}},
      ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);

  assert_debug_snapshot!(
    "can_yield_unmatched_shape_for_mismatched_array_items__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let array_body = json!(["4", "6", 8, "10"]);
  let shape_id = String::from("list_1");
  let results = diff_shape(&shape_projection, Some(array_body), &shape_id);

  assert_debug_snapshot!(
    "can_yield_unmatched_shape_for_mismatched_array_items__results",
    results
  );
  assert_eq!(results.len(), 3);
}

#[test]
fn can_match_shape_for_nested_arrays() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"list_1","baseShapeId":"$list","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"list_2","baseShapeId":"$list","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"number_shape_1","baseShapeId":"$number","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"list_1","providerDescriptor":{"ShapeProvider":{"shapeId":"list_2"}},"consumingParameterId":"$listItem"}}}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"list_2","providerDescriptor":{"ShapeProvider":{"shapeId":"number_shape_1"}},"consumingParameterId":"$listItem"}}}},
      ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);

  assert_debug_snapshot!(
    "can_match_shape_for_nested_arrays__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let array_body = json!([[4, 6, 8, 10], [3, 9, 12, 15]]);
  let shape_id = String::from("list_1");
  let results = diff_shape(&shape_projection, Some(array_body), &shape_id);

  assert_debug_snapshot!("can_match_shape_for_nested_arrays__results", results);
  assert_eq!(results.len(), 0);
}

#[test]
fn can_yield_unmatched_shape_for_field() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"object_1","baseShapeId":"$object","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},

      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"FieldAdded":{"fieldId":"field_1","shapeId":"object_1","name":"firstName","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"field_1","shapeId":"string_shape_1"}}}},
      
      {"ShapeAdded":{"shapeId":"string_shape_2","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"FieldAdded":{"fieldId":"field_2","shapeId":"object_1","name":"lastName","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"field_2","shapeId":"string_shape_2"}}}},

      {"ShapeAdded":{"shapeId":"number_shape_1","baseShapeId":"$number","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"FieldAdded":{"fieldId":"field_3","shapeId":"object_1","name":"age","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"field_3","shapeId":"number_shape_1"}}}},
    ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);

  assert_debug_snapshot!(
    "can_yield_unmatched_shape_for_field__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let object_body = json!({
    "firstName": "Homer",
    "lastName": "Simpson",
    "age": "not-a-valid-number"
  });
  let shape_id = String::from("object_1");
  let results = diff_shape(&shape_projection, Some(object_body), &shape_id);

  assert_debug_snapshot!("can_yield_unmatched_shape_for_field__results", results);
  assert_ne!(results.len(), 0);
}
