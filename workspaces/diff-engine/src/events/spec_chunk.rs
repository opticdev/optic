use super::{RfcEvent, SpecEvent};
use cqrs_core::Event;
use serde_json;

#[derive(Debug)]
pub struct SpecChunkEvent {
  pub id: Option<String>,
  pub name: String,
  pub is_root: bool,
  pub parent_id: Option<String>,
  pub events: Vec<SpecEvent>,
}

impl Event for SpecChunkEvent {
  fn event_type(&self) -> &'static str {
    "spec_chunk_event"
  }
}

impl From<(String, bool, Vec<SpecEvent>)> for SpecChunkEvent {
  fn from((name, is_root, events): (String, bool, Vec<SpecEvent>)) -> Self {
    let (id, parent_id) = if is_root {
      (Some(String::from("root")), None)
    } else {
      let first_event = events.first();

      first_event
        .map(|first_event| match first_event {
          SpecEvent::RfcEvent(RfcEvent::BatchCommitStarted(e)) => {
            (Some(e.batch_id.clone()), e.parent_id.clone())
          }
          _ => (None, None),
        })
        .unwrap_or((None, None))
    };

    Self {
      id,
      name,
      is_root,
      events,
      parent_id,
    }
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use serde_json::json;

  #[test]
  pub fn can_construct_spec_chunk_events() {
    let spec_chunk_events : Vec<SpecChunkEvent> = vec![
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
  ].into_iter().map(|(file_name, is_root, events_json)| {
    let events : Vec<SpecEvent> = serde_json::from_value(events_json).expect("example events should be valid spec events");

    SpecChunkEvent::from((file_name, is_root, events))
  }).collect();

    dbg!(&spec_chunk_events);

    assert_eq!(
      spec_chunk_events
        .iter()
        .map(|chunk| chunk.parent_id.is_some())
        .collect::<Vec<_>>(),
      vec![false, true, true]
    );

    assert_eq!(
      spec_chunk_events.iter().all(|chunk| chunk.id.is_some()),
      true
    )
  }
}
