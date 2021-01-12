use insta::assert_debug_snapshot;
use optic_diff_engine::{diff_shape, BodyDescriptor, ShapeProjection, SpecEvent};
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

  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(string_body)),
    &shape_id,
  );

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
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(number_body)),
    &shape_id,
  );
  let fingerprints = results
    .iter()
    .map(|result| result.fingerprint())
    .collect::<Vec<_>>();

  assert_eq!(results.len(), 1);
  assert_debug_snapshot!(
    "can_diff_primitive_json_and_yield_unmatched_shape__results",
    results
  );
  assert_debug_snapshot!(
    "can_diff_primitive_json_and_yield_unmatched_shape__fingerprints",
    fingerprints
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
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(string_body)),
    &unknown_shape_id,
  );
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
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(array_body)),
    &shape_id,
  );
  let fingerprints = results
    .iter()
    .map(|result| result.fingerprint())
    .collect::<Vec<_>>();

  assert_debug_snapshot!("can_match_array_json__results", results);
  assert_eq!(results.len(), 0);
  assert_debug_snapshot!("can_match_array_json__fingerprints", fingerprints);
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
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(array_body)),
    &shape_id,
  );
  let fingerprints = results
    .iter()
    .map(|result| result.fingerprint())
    .collect::<Vec<_>>();

  assert_debug_snapshot!("can_yield_unmatched_shape_for_array_body__results", results);
  assert_eq!(results.len(), 1);
  assert_debug_snapshot!(
    "can_yield_unmatched_shape_for_array_body__fingerprints",
    fingerprints
  );
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
  let array_body = json!(["4", 8, false]);
  let shape_id = String::from("list_1");
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(array_body)),
    &shape_id,
  );
  let fingerprints = results
    .iter()
    .map(|result| result.fingerprint())
    .collect::<Vec<_>>();

  assert_debug_snapshot!(
    "can_yield_unmatched_shape_for_mismatched_array_items__results",
    results
  );
  assert_eq!(results.len(), 2); // one per unique type of array item
  assert_debug_snapshot!(
    "can_yield_unmatched_shape_for_mismatched_array_items__fingerprints",
    fingerprints
  );
}

#[test]
fn yields_unmatched_shape_once_for_each_uniquely_shaped_array_item() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"list_1","baseShapeId":"$list","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"number_shape_1","baseShapeId":"$number","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"list_1","providerDescriptor":{"ShapeProvider":{"shapeId":"number_shape_1"}},"consumingParameterId":"$listItem"}}}},
      ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);

  assert_debug_snapshot!(
    "yields_unmatched_shape_once_for_each_uniquely_shaped_array_item__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let array_body = json!(["4", "6", 8, "10", { "not-a": "number" }, { "not-a": "boolean" }, { "different": "object-structure" }]);
  let shape_id = String::from("list_1");
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(array_body)),
    &shape_id,
  );
  let fingerprints = results
    .iter()
    .map(|result| result.fingerprint())
    .collect::<Vec<_>>();

  assert_debug_snapshot!(
    "yields_unmatched_shape_once_for_each_uniqu_array_item__results",
    results
  );
  assert_eq!(results.len(), 3); // one per unique type of array item (string, object {not-a: string}, object {different: string}
  assert_debug_snapshot!(
    "yields_unmatched_shape_once_for_each_uniquely_shaped_array_item__fingerprints",
    fingerprints
  );
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
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(array_body)),
    &shape_id,
  );
  let fingerprints = results
    .iter()
    .map(|result| result.fingerprint())
    .collect::<Vec<_>>();

  assert_debug_snapshot!("can_match_shape_for_nested_arrays__results", results);
  assert_eq!(results.len(), 0);
  assert_debug_snapshot!(
    "can_match_shape_for_nested_arrays__fingerprints",
    fingerprints
  );
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
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(object_body)),
    &shape_id,
  );
  let fingerprints = results
    .iter()
    .map(|result| result.fingerprint())
    .collect::<Vec<_>>();

  assert_debug_snapshot!("can_yield_unmatched_shape_for_field__results", results);
  assert_ne!(results.len(), 0);
  assert_debug_snapshot!(
    "can_yield_unmatched_shape_for_field__fingerprints",
    fingerprints
  );
}

#[test]
fn can_yield_unmatched_shape_for_missing_field() {
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

  let object_body = json!({
    "firstName": "Homer",
    "lastName": "Simpson"
  });
  let shape_id = String::from("object_1");
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(object_body)),
    &shape_id,
  );
  let fingerprints = results
    .iter()
    .map(|result| result.fingerprint())
    .collect::<Vec<_>>();

  assert_debug_snapshot!(
    "can_yield_unmatched_shape_for_missing_field__results",
    results
  );
  assert_ne!(results.len(), 0);
  assert_debug_snapshot!(
    "can_yield_unmatched_shape_for_missing_field__fingerprints",
    fingerprints
  );
}

#[test]
fn can_diff_nullable() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"number_shape_1","baseShapeId":"$number","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"nullable_1","baseShapeId":"$nullable","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"nullable_1","providerDescriptor":{"ShapeProvider":{"shapeId":"number_shape_1"}},"consumingParameterId":"$nullableInner"}}}},
      {"ShapeAdded":{"shapeId":"list_1","baseShapeId":"$list","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"list_1","providerDescriptor":{"ShapeProvider":{"shapeId":"nullable_1"}},"consumingParameterId":"$listItem"}}}},
      ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);

  assert_debug_snapshot!(
    "can_diff_nullable__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let array_body = json!([4, null, 8, "s"]);
  let shape_id = String::from("list_1");
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(array_body)),
    &shape_id,
  );

  assert_debug_snapshot!("can_diff_nullable__results", results);
  assert_eq!(results.len(), 2);
}

#[test]
fn can_diff_optional() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"object_1","baseShapeId":"$object","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},

      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"optional_shape_1","baseShapeId":"$optional","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"optional_shape_1","providerDescriptor":{"ShapeProvider":{"shapeId":"string_shape_1"}},"consumingParameterId":"$optionalInner"}}}},
      {"FieldAdded":{"fieldId":"field_1","shapeId":"object_1","name":"firstName","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"field_1","shapeId":"optional_shape_1"}}}},
      {"ShapeAdded":{"shapeId":"list_1","baseShapeId":"$list","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"list_1","providerDescriptor":{"ShapeProvider":{"shapeId":"object_1"}},"consumingParameterId":"$listItem"}}}},
      
    ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);
  assert_debug_snapshot!(
    "can_diff_optional__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let body = json!([{
    "firstName": "Homer"
  }, {
    "firstName": 3
  }, {

  }
  ]);
  let shape_id = String::from("list_1");
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(body)),
    &shape_id,
  );

  assert_debug_snapshot!("can_diff_optional__results", results);
  assert_eq!(results.len(), 2); //@BUG: this should be 1, right? and the trail looks wrong
}

#[test]
fn can_diff_one_of() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"object_1","baseShapeId":"$object","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},

      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"boolean_shape_1","baseShapeId":"$boolean","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeAdded":{"shapeId":"oneof_shape_1","baseShapeId":"$oneOf","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeParameterAdded":{
        "shapeParameterId":"oneof_parameter_1",
        "shapeId":"oneof_shape_1",
        "name":"",
        "shapeDescriptor":{
          "ProviderInShape":{"shapeId":"oneof_shape_1",
          "providerDescriptor":{"NoProvider":{}},
          "consumingParameterId":"oneof_parameter_1"}},
        }},     
         {"ShapeParameterAdded":{
          "shapeParameterId":"oneof_parameter_2",
          "shapeId":"oneof_shape_1",
          "name":"",
          "shapeDescriptor":{
            "ProviderInShape":{"shapeId":"oneof_shape_1",
            "providerDescriptor":{"NoProvider":{}},
            "consumingParameterId":"oneof_parameter_2"}},
          }},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"oneof_shape_1","providerDescriptor":{"ShapeProvider":{"shapeId":"string_shape_1"}},"consumingParameterId":"oneof_parameter_1"}}}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"oneof_shape_1","providerDescriptor":{"ShapeProvider":{"shapeId":"boolean_shape_1"}},"consumingParameterId":"oneof_parameter_2"}}}},
      {"FieldAdded":{"fieldId":"field_1","shapeId":"object_1","name":"firstName","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"field_1","shapeId":"oneof_shape_1"}}}},
      {"ShapeAdded":{"shapeId":"list_1","baseShapeId":"$list","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"ShapeParameterShapeSet":{"shapeDescriptor":{"ProviderInShape":{"shapeId":"list_1","providerDescriptor":{"ShapeProvider":{"shapeId":"object_1"}},"consumingParameterId":"$listItem"}}}},
      
    ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);
  assert_debug_snapshot!(
    "can_diff_one_of__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let body = json!([{
    "firstName": "Homer"
  }, {
    "firstName": 3
  }, {
    "firstName": false
  }, {

  }
  ]);
  let shape_id = String::from("list_1");
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(body)),
    &shape_id,
  );

  assert_debug_snapshot!("can_diff_one_of__results", results);
  assert_eq!(results.len(), 3);
}

#[test]
fn can_handle_base_shape_changes() {
  let events : Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"ShapeAdded":{"shapeId":"object_1","baseShapeId":"$object","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},

      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"FieldAdded":{"fieldId":"field_1","shapeId":"object_1","name":"firstName","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"field_1","shapeId":"string_shape_1"}}}},

      {"ShapeAdded":{"shapeId":"string_shape_2","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"FieldAdded":{"fieldId":"field_2","shapeId":"object_1","name":"lastName","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"field_2","shapeId":"string_shape_2"}}}},

      {"ShapeAdded":{"shapeId":"number_shape_1","baseShapeId":"$number","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"FieldAdded":{"fieldId":"field_3","shapeId":"object_1","name":"age","shapeDescriptor":{"FieldShapeFromShape":{"fieldId":"field_3","shapeId":"number_shape_1"}}}},
      {"BaseShapeSet": {
        "shapeId": "number_shape_1",
        "baseShapeId": "$string"
      }}
    ])
  ).expect("should be able to deserialize shape added events as spec events");

  let shape_projection = ShapeProjection::from(events);

  assert_debug_snapshot!(
    "can_handle_base_shape_changes__shape_projection_graph",
    Dot::with_config(&shape_projection.graph, &[])
  );
  let object_body = json!({
    "firstName": "Homer",
    "lastName": "Simpson",
    "age": "not-a-valid-number"
  });
  let shape_id = String::from("object_1");
  let results = diff_shape(
    &shape_projection,
    Some(BodyDescriptor::from(object_body)),
    &shape_id,
  );
  let fingerprints = results
      .iter()
      .map(|result| result.fingerprint())
      .collect::<Vec<_>>();

  assert_debug_snapshot!("can_handle_base_shape_changes__results", results);
  assert_eq!(results.len(), 0);
  assert_debug_snapshot!(
    "can_handle_base_shape_changes__fingerprints",
    fingerprints
  );
}