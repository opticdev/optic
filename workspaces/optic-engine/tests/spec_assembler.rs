use insta::assert_debug_snapshot;
use optic_engine::{SpecAssemblerProjection, SpecChunkEvent, SpecEvent};
use serde_json::json;

#[test]
pub fn can_assemble_spec_events_from_serialized_chunks() {
  let raw_chunks = vec![
    (
      String::from("specification.json"),
      true,
      json!([
        {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
        {"ContributionAdded": {"id": "path_1.GET","key": "purpose","value": "todos"}}
      ]),
    ),
    (
      String::from("0002.json"),
      false,
      // Adding a simple shape to the GET /todos response
      json!([
        {"BatchCommitStarted": {"batchId": "batch-2", "parentId": "batch-1", "commitMessage": "dsasa" }},
        {"ShapeAdded": { "shapeId": "object_shape_1", "baseShapeId": "$object", "parameters": { "DynamicParameterList": { "shapeParameterIds": [] } }, "name": "" }},
        {"ShapeAdded": {"shapeId": "boolean_shape_1","baseShapeId": "$boolean","parameters": {"DynamicParameterList": {"shapeParameterIds": []}},"name": ""}},
        {"FieldAdded": {"fieldId": "field_1","shapeId": "object_shape_1","name": "isDone","shapeDescriptor": {"FieldShapeFromShape": {"fieldId": "field_1","shapeId": "boolean_shape_1"}}}},
        {"ResponseBodySet": {"responseId": "response_1","bodyDescriptor": {"httpContentType": "application/json","shapeId": "object_shape_1","isRemoved": false}}},
        {"BatchCommitEnded": { "batchId": "batch-2" }}
      ]),
    ),
    (
      String::from("0001.json"),
      false,
      // Adding a Request and Response for GET /todos
      json!([
        {"BatchCommitStarted": {"batchId": "batch-1", "parentId": "root", "commitMessage": "Add Request and Response for GET /todos" }},
        {"RequestAdded": { "requestId": "request_1","pathId": "path_1","httpMethod": "GET" }},
        {"ResponseAddedByPathAndMethod": { "responseId": "response_1", "pathId": "path_1", "httpMethod": "GET", "httpStatusCode": 200 }},
        {"BatchCommitEnded": { "batchId": "batch-1" }}
      ]),
    ),
  ];

  let spec_chunk_events: Vec<SpecChunkEvent> = raw_chunks
    .clone()
    .into_iter()
    .map(|(file_name, is_root, events_json)| {
      let events: Vec<SpecEvent> =
        serde_json::from_value(events_json).expect("example events should be valid spec events");

      SpecChunkEvent::from((file_name, is_root, events))
    })
    .collect();

  // dbg!(&spec_chunk_events);

  let assembler_projection = SpecAssemblerProjection::from(spec_chunk_events);

  // dbg!(&assembler_projection);

  let assembled_events = assembler_projection
    .into_events()
    .expect("example chunks should assemble");

  // dbg!(&assembled_events);

  let expected_events = vec![
    raw_chunks[0].clone(),
    raw_chunks[2].clone(),
    raw_chunks[1].clone(),
  ]
  .into_iter()
  .flat_map(|(_filename, _is_root, events)| {
    serde_json::from_value::<Vec<SpecEvent>>(events).unwrap()
  })
  .collect::<Vec<_>>();

  // dbg!(&expected_events);

  assert_eq!(assembled_events, expected_events);

  assert_debug_snapshot!(
    "can_assemble_spec_events_from_serialized_chunks__assembled_events",
    assembled_events
  );
}
