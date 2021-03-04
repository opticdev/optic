use super::{RfcEvent, SpecEvent};
use cqrs_core::Event;
use serde_json;
use std::convert::TryFrom;

#[derive(Debug, Clone)]
pub enum SpecChunkEvent {
  Root(RootChunkEvent),
  Batch(BatchChunkEvent),
  Unknown(UnknownChunkEvent),
}

#[derive(Debug, Clone)]
pub struct RootChunkEvent {
  pub id: String,
  pub name: String,
  pub events: Vec<SpecEvent>,
}

#[derive(Debug, Clone)]
pub struct BatchChunkEvent {
  pub id: String,
  pub name: String,
  pub parent_id: String,
  pub events: Vec<SpecEvent>,
}

#[derive(Debug, Clone)]
pub struct UnknownChunkEvent {
  pub name: String,
  pub events: Vec<SpecEvent>,
}

impl SpecChunkEvent {
  pub fn batch_from_events(
    batch_id: String,
    events: Vec<SpecEvent>,
  ) -> Result<SpecChunkEvent, &'static str> {
    let batch = BatchChunkEvent::try_from((batch_id, events)).map_err(|(msg, _, _)| msg)?;

    Ok(SpecChunkEvent::Batch(batch))
  }

  pub fn root_from_events(events: Vec<SpecEvent>) -> SpecChunkEvent {
    SpecChunkEvent::from((String::from("root"), true, events))
  }

  pub fn events(&self) -> &Vec<SpecEvent> {
    let events = match self {
      SpecChunkEvent::Root(chunk) => &chunk.events,
      SpecChunkEvent::Batch(chunk) => &chunk.events,
      SpecChunkEvent::Unknown(chunk) => &chunk.events,
    };

    events
  }

  pub fn into_events_iter(self) -> impl Iterator<Item = SpecEvent> {
    let events = match self {
      SpecChunkEvent::Root(chunk) => chunk.events,
      SpecChunkEvent::Batch(chunk) => chunk.events,
      SpecChunkEvent::Unknown(chunk) => chunk.events,
    };

    events.into_iter()
  }

  pub fn name(&self) -> String {
    match self {
      SpecChunkEvent::Root(chunk) => chunk.name.clone(),
      SpecChunkEvent::Batch(chunk) => chunk.name.clone(),
      SpecChunkEvent::Unknown(chunk) => chunk.name.clone(),
    }
  }

  pub fn len(&self) -> usize {
    match self {
      SpecChunkEvent::Root(chunk) => chunk.events.len(),
      SpecChunkEvent::Batch(chunk) => chunk.events.len(),
      SpecChunkEvent::Unknown(chunk) => chunk.events.len(),
    }
  }
}

impl Event for SpecChunkEvent {
  fn event_type(&self) -> &'static str {
    match self {
      SpecChunkEvent::Root(evt) => evt.event_type(),
      SpecChunkEvent::Batch(evt) => evt.event_type(),
      SpecChunkEvent::Unknown(evt) => evt.event_type(),
    }
  }
}

impl Event for RootChunkEvent {
  fn event_type(&self) -> &'static str {
    "RootChunkEvent"
  }
}

impl Event for BatchChunkEvent {
  fn event_type(&self) -> &'static str {
    "BatchChunkEvent"
  }
}

impl Event for UnknownChunkEvent {
  fn event_type(&self) -> &'static str {
    "UnknownChunkEvent"
  }
}

impl RootChunkEvent {
  pub fn last_batch_id(&self) -> &String {
    self
      .events
      .iter()
      .rev()
      .find_map(|event| match event {
        SpecEvent::RfcEvent(RfcEvent::BatchCommitEnded(e)) => Some(&e.batch_id),
        _ => None,
      })
      .unwrap_or_else(|| &self.id)
  }
}

// TODO: Implement this for an impl Iterator<Item=SpecEvent> rather than requiring a Vec
impl From<(String, bool, Vec<SpecEvent>)> for SpecChunkEvent {
  fn from((name, is_root, events): (String, bool, Vec<SpecEvent>)) -> Self {
    if is_root {
      Self::Root(RootChunkEvent {
        id: String::from("root"),
        name,
        events,
      })
    } else {
      match BatchChunkEvent::try_from((name, events)) {
        Ok(batch_chunk) => Self::Batch(batch_chunk),
        Err((msg, name, events)) => Self::Unknown(UnknownChunkEvent { name, events }),
      }
    }
  }
}

// TODO: Implement this for an impl Iterator<Item=SpecEvent> rather than requiring a Vec
impl TryFrom<(String, Vec<SpecEvent>)> for BatchChunkEvent {
  // Give ownership of name and events back when we fail
  type Error = (&'static str, String, Vec<SpecEvent>); // TODO: replace with proper error type

  fn try_from((name, events): (String, Vec<SpecEvent>)) -> Result<Self, Self::Error> {
    let batch_ids = parse_batch_chunk_events(&events);

    match batch_ids {
      Ok((id, parent_id)) => Ok(Self {
        id,
        name,
        parent_id,
        events,
      }),
      Err(err) => Err((err, name, events)),
    }
  }
}

fn parse_batch_chunk_events(events: &Vec<SpecEvent>) -> Result<(String, String), &'static str> {
  let first_event = events.first().ok_or("Chunk does not have any events")?;

  let batch_start_event = match first_event {
    SpecEvent::RfcEvent(RfcEvent::BatchCommitStarted(e)) => Ok(e),
    _ => Err("Chunk does not start with a BatchCommitStarted event"),
  }?;

  let batch_id = batch_start_event.batch_id.clone();
  let parent_id = match &batch_start_event.parent_id {
    Some(parent_id) => Ok(parent_id.clone()),
    _ => Err("BatchCommitStarted does not have a parent_id"),
  }?;

  let last_event = events.last().ok_or("Chunk does not have any events")?;

  let batch_end_event = match last_event {
    SpecEvent::RfcEvent(RfcEvent::BatchCommitEnded(e)) => Ok(e),
    _ => Err("Chunk does not end in a BatchCommitEnded event"),
  }?;

  if batch_end_event.batch_id != batch_id {
    Err("BatchCommitEnded event does not have matching parent_id")
  } else {
    Ok(())
  }?;

  let intermediate_events = events.iter().skip(1).take(events.len() - 2); // skip the first, don't take the last
  for event in intermediate_events {
    if let SpecEvent::RfcEvent(RfcEvent::BatchCommitStarted(e)) = event {
      return Err("Chunk cannot include nested BatchCommitStarted events");
    } else if let SpecEvent::RfcEvent(RfcEvent::BatchCommitEnded(e)) = event {
      return Err("Chunk cannot include nested BatchCommitEnded events");
    }
  }

  Ok((batch_id, parent_id))
}

#[cfg(test)]
mod test {
  use super::*;
  use insta::assert_debug_snapshot;
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
        .map(|chunk| matches!(chunk, SpecChunkEvent::Root(_)))
        .collect::<Vec<_>>(),
      vec![true, false, false]
    );

    assert_eq!(
      spec_chunk_events
        .iter()
        .map(|chunk| matches!(chunk, SpecChunkEvent::Batch(_)))
        .collect::<Vec<_>>(),
      vec![false, true, true]
    );
  }

  #[test]
  pub fn constructs_valid_batch_chunks() {
    let valid_batch_events = serde_json::from_value::<Vec<SpecEvent>>(json!([
      {"BatchCommitStarted": {"batchId": "batch-1", "parentId": "root", "commitMessage": "Add Request and Response for GET /todos" }},
      {"RequestAdded": { "requestId": "request_1","pathId": "path_1","httpMethod": "GET" }},
      {"ResponseAddedByPathAndMethod": { "responseId": "response_1", "pathId": "path_1", "httpMethod": "GET", "httpStatusCode": 200 }},
      {"BatchCommitEnded": { "batchId": "batch-1" }}
    ])).unwrap();

    let valid_batch_events_result =
      BatchChunkEvent::try_from((String::from("valid_batch_events"), valid_batch_events));
    assert!(valid_batch_events_result.is_ok());

    let empty_events = Vec::<SpecEvent>::new();
    let empty_events_result =
      BatchChunkEvent::try_from((String::from("empty_events"), empty_events));
    assert!(empty_events_result.is_err());
    assert_debug_snapshot!(
      "constructs_valid_batch_chunks__empty_events",
      empty_events_result.unwrap_err().0
    );

    let missing_batch_start = serde_json::from_value::<Vec<SpecEvent>>(json!([
      {"RequestAdded": { "requestId": "request_1","pathId": "path_1","httpMethod": "GET" }},
      {"ResponseAddedByPathAndMethod": { "responseId": "response_1", "pathId": "path_1", "httpMethod": "GET", "httpStatusCode": 200 }},
      {"BatchCommitEnded": { "batchId": "batch-1" }}
    ])).unwrap();

    let missing_batch_start_result =
      BatchChunkEvent::try_from((String::from("missing_batch_start"), missing_batch_start));
    assert!(missing_batch_start_result.is_err());
    assert_debug_snapshot!(
      "constructs_valid_batch_chunks__missing_batch_start",
      missing_batch_start_result.unwrap_err().0
    );

    let missing_parent_id = serde_json::from_value::<Vec<SpecEvent>>(json!([
      {"BatchCommitStarted": {"batchId": "batch-1", "commitMessage": "Add Request and Response for GET /todos" }},
      {"RequestAdded": { "requestId": "request_1","pathId": "path_1","httpMethod": "GET" }},
      {"ResponseAddedByPathAndMethod": { "responseId": "response_1", "pathId": "path_1", "httpMethod": "GET", "httpStatusCode": 200 }},
      {"BatchCommitEnded": { "batchId": "batch-1" }}
    ])).unwrap();

    let missing_parent_id_result =
      BatchChunkEvent::try_from((String::from("missing_parent_id"), missing_parent_id));
    assert!(missing_parent_id_result.is_err());
    assert_debug_snapshot!(
      "constructs_valid_batch_chunks__missing_parent_id",
      missing_parent_id_result.unwrap_err().0
    );

    let missing_end_event = serde_json::from_value::<Vec<SpecEvent>>(json!([
      {"BatchCommitStarted": {"batchId": "batch-1", "parentId": "root", "commitMessage": "Add Request and Response for GET /todos" }},
      {"RequestAdded": { "requestId": "request_1","pathId": "path_1","httpMethod": "GET" }},
      {"ResponseAddedByPathAndMethod": { "responseId": "response_1", "pathId": "path_1", "httpMethod": "GET", "httpStatusCode": 200 }}
    ])).unwrap();

    let missing_end_event_result =
      BatchChunkEvent::try_from((String::from("missing_end_event"), missing_end_event));
    assert!(missing_end_event_result.is_err());
    assert_debug_snapshot!(
      "constructs_valid_batch_chunks__missing_end_event",
      missing_end_event_result.unwrap_err().0
    );

    let out_of_order_end_event = serde_json::from_value::<Vec<SpecEvent>>(json!([
      {"BatchCommitStarted": {"batchId": "batch-1", "parentId": "root", "commitMessage": "Add Request and Response for GET /todos" }},
      {"RequestAdded": { "requestId": "request_1","pathId": "path_1","httpMethod": "GET" }},
      {"ResponseAddedByPathAndMethod": { "responseId": "response_1", "pathId": "path_1", "httpMethod": "GET", "httpStatusCode": 200 }},
      {"BatchCommitEnded": { "batchId": "batch-2" }}
    ])).unwrap();

    let out_of_order_end_event_result = BatchChunkEvent::try_from((
      String::from("out_of_order_end_event"),
      out_of_order_end_event,
    ));
    assert!(out_of_order_end_event_result.is_err());
    assert_debug_snapshot!(
      "constructs_valid_batch_chunks__out_of_order_end_event",
      out_of_order_end_event_result.unwrap_err().0
    );

    let nested_batch_event = serde_json::from_value::<Vec<SpecEvent>>(json!([
      {"BatchCommitStarted": {"batchId": "batch-1", "parentId": "root", "commitMessage": "Add Request and Response for GET /todos" }},
      {"BatchCommitStarted": {"batchId": "batch-2", "parentId": "root", "commitMessage": "Nested batch" }},
      {"RequestAdded": { "requestId": "request_1","pathId": "path_1","httpMethod": "GET" }},
      {"ResponseAddedByPathAndMethod": { "responseId": "response_1", "pathId": "path_1", "httpMethod": "GET", "httpStatusCode": 200 }},
      {"BatchCommitEnded": { "batchId": "batch-2" }},
      {"BatchCommitEnded": { "batchId": "batch-1" }}
    ])).unwrap();

    let nested_batch_event_result =
      BatchChunkEvent::try_from((String::from("nested_batch_event"), nested_batch_event));
    assert!(nested_batch_event_result.is_err());
    assert_debug_snapshot!(
      "constructs_valid_batch_chunks__nested_batch_event",
      nested_batch_event_result.unwrap_err().0
    );
  }
}
