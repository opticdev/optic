use chrono::{DateTime, TimeZone, Utc};
use std::process::Command;
use uuid::Uuid;

use cqrs_core::{Aggregate, AggregateCommand, AggregateEvent};
pub use serde::{Deserialize, Serialize};

pub mod endpoint;
pub mod rfc;
pub mod shape;

pub use endpoint::EndpointCommand;
pub use rfc::RfcCommand;
use shape::AddShape;
pub use shape::ShapeCommand;

use crate::events::rfc as rfc_events;
use crate::events::shape as shape_events;
use crate::events::{
  EndpointEvent, EventContext, RfcEvent, ShapeEvent, SpecEvent, WithEventContext,
};
use crate::projections::SpecProjection;
use crate::queries::history::HistoryQueries;
use crate::state::shape::ShapeKind;

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(untagged)]
pub enum SpecCommand {
  EndpointCommand(EndpointCommand),
  RfcCommand(RfcCommand),
  ShapeCommand(ShapeCommand),
}

impl From<EndpointCommand> for SpecCommand {
  fn from(endpoint_command: EndpointCommand) -> Self {
    Self::EndpointCommand(endpoint_command)
  }
}

impl From<RfcCommand> for SpecCommand {
  fn from(rfc_command: RfcCommand) -> Self {
    Self::RfcCommand(rfc_command)
  }
}

impl From<ShapeCommand> for SpecCommand {
  fn from(shape_command: ShapeCommand) -> Self {
    Self::ShapeCommand(shape_command)
  }
}

// Errors
// ------

#[derive(Debug)]
pub enum SpecCommandError {
  Other(&'static str),
  Validation(String),
  Unimplemented(&'static str, SpecCommand),
}

impl std::fmt::Display for SpecCommandError {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    f.write_str(&self.to_string())
  }
}

impl std::error::Error for SpecCommandError {}

// CommandContext
// --------------

#[derive(Clone, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CommandContext {
  pub client_id: String,
  pub client_session_id: String,
  pub client_command_batch_id: String,
  pub created_at: DateTime<Utc>,
}

impl CommandContext {
  pub fn new(
    batch_id: String,
    client_id: String,
    client_session_id: String,
    created_at: DateTime<impl TimeZone>,
  ) -> Self {
    Self {
      client_id,
      client_command_batch_id: batch_id,
      client_session_id,
      created_at: created_at.with_timezone(&Utc),
    }
  }
}

impl Default for CommandContext {
  fn default() -> Self {
    Self {
      client_id: String::from("anonymous"),
      client_session_id: String::from("unknown-session"),
      client_command_batch_id: String::from("unknown-batch"),
      created_at: Utc.timestamp(0, 0),
    }
  }
}

// SpecCommandHandler
// ------------------

#[derive(Debug, Default)]
pub struct SpecCommandHandler {
  command_context: CommandContext,
  spec_projection: SpecProjection,
}

impl SpecCommandHandler {
  pub fn new(command_context: CommandContext, spec_projection: SpecProjection) -> Self {
    Self {
      command_context,
      spec_projection,
    }
  }

  pub fn with_command_context(&mut self, command_context: CommandContext) {
    self.command_context = command_context
  }
}

impl Aggregate for SpecCommandHandler {
  fn aggregate_type() -> &'static str {
    "spec-command-handler"
  }
}

impl AggregateEvent<SpecCommandHandler> for SpecEvent {
  fn apply_to(self, command_handler: &mut SpecCommandHandler) {
    command_handler.spec_projection.apply(self)
  }
}

impl<I> From<I> for SpecCommandHandler
where
  I: IntoIterator,
  I::Item: AggregateEvent<SpecProjection>,
{
  fn from(events: I) -> Self {
    let spec_projection = SpecProjection::from(events);
    Self::new(CommandContext::default(), spec_projection)
  }
}

// Command handling
// ----------------

impl AggregateCommand<SpecCommandHandler> for SpecCommand {
  type Error = SpecCommandError;
  type Event = SpecEvent;
  type Events = Vec<SpecEvent>;

  fn execute_on(self, command_handler: &SpecCommandHandler) -> Result<Self::Events, Self::Error> {
    let mut events = command_handler.spec_projection.execute(self)?;
    let event_context = EventContext::from(command_handler.command_context.clone());
    for event in &mut events {
      event.with_event_context(event_context.clone());
    }
    Ok(events)
  }
}

impl AggregateCommand<SpecProjection> for SpecCommand {
  type Error = SpecCommandError;
  type Event = SpecEvent;
  type Events = Vec<SpecEvent>;

  fn execute_on(self, spec_projection: &SpecProjection) -> Result<Self::Events, Self::Error> {
    let events = match self {
      SpecCommand::EndpointCommand(EndpointCommand::AddPathParameter(command)) => {
        let path_parameter_added_event = spec_projection
          .endpoint()
          .execute(EndpointCommand::AddPathParameter(command))?
          .into_iter()
          .find(|event| matches!(event, EndpointEvent::PathParameterAdded(_)))
          .expect("endpoint command handler should have failed if event wasnt produced");

        let path_parameter_added = match &path_parameter_added_event {
          EndpointEvent::PathParameterAdded(descriptor) => descriptor,
          _ => unreachable!(), // we already found the event of the pattern above or have panicked instead
        };

        let shape_added_event = ShapeEvent::from(ShapeCommand::add_shape(
          Uuid::new_v4().to_hyphenated().to_string(),
          ShapeKind::StringKind,
          String::from(""),
        ));

        let shape_id = match &shape_added_event {
          ShapeEvent::ShapeAdded(event) => event.shape_id.clone(),
          _ => unreachable!(),
        };

        let path_parameter_shape_set_event = EndpointEvent::from(
          EndpointCommand::set_path_parameter_shape(path_parameter_added.path_id.clone(), shape_id),
        );

        vec![
          SpecEvent::from(path_parameter_added_event),
          SpecEvent::from(shape_added_event),
          SpecEvent::from(path_parameter_shape_set_event),
        ]
      }

      SpecCommand::EndpointCommand(EndpointCommand::SetPathParameterShape(command)) => {
        spec_projection
          .shape()
          .execute(EndpointCommand::SetPathParameterShape(command.clone()))?; // validate shape exists
        let endpoint_events = spec_projection
          .endpoint()
          .execute(EndpointCommand::SetPathParameterShape(command.clone()))?;

        endpoint_events
          .into_iter()
          .map(|endpoint_event| SpecEvent::from(endpoint_event))
          .collect::<Vec<_>>()
      }

      SpecCommand::EndpointCommand(EndpointCommand::SetRequestBodyShape(command)) => {
        spec_projection
          .shape()
          .execute(EndpointCommand::SetRequestBodyShape(command.clone()))?;
        let endpoint_events = spec_projection
          .endpoint()
          .execute(EndpointCommand::SetRequestBodyShape(command))?;

        endpoint_events
          .into_iter()
          .map(|endpoint_event| SpecEvent::from(endpoint_event))
          .collect::<Vec<_>>()
      }

      SpecCommand::EndpointCommand(EndpointCommand::SetResponseBodyShape(command)) => {
        spec_projection
          .shape()
          .execute(EndpointCommand::SetResponseBodyShape(command.clone()))?;
        let endpoint_events = spec_projection
          .endpoint()
          .execute(EndpointCommand::SetResponseBodyShape(command))?;

        endpoint_events
          .into_iter()
          .map(|endpoint_event| SpecEvent::from(endpoint_event))
          .collect::<Vec<_>>()
      }

      // endpoint commands that can be purely handled by the endpoint projection
      SpecCommand::EndpointCommand(endpoint_command) => spec_projection
        .endpoint()
        .execute(endpoint_command)?
        .into_iter()
        .map(|endpoint_event| SpecEvent::from(endpoint_event))
        .collect::<Vec<_>>(),

      SpecCommand::RfcCommand(rfc_command) => spec_projection
        .history()
        .execute(rfc_command)?
        .into_iter()
        .map(|rfc_event| SpecEvent::from(rfc_event))
        .collect::<Vec<_>>(),

      SpecCommand::ShapeCommand(shape_command) => spec_projection
        .shape()
        .execute(shape_command)?
        .into_iter()
        .map(|shape_event| SpecEvent::from(shape_event))
        .collect::<Vec<_>>(),
    };
    Ok(events)
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use chrono::Local;
  use insta::assert_debug_snapshot;
  use serde_json::json;

  #[test]
  pub fn can_handle_add_path_parameter_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = SpecProjection::from(initial_events);

    let valid_command: SpecCommand = serde_json::from_value(json!(
      {"AddPathParameter": {"pathId": "path_2","parentPathId": "path_1","name": "todoId"}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 3);
    // TODO: figure out how insta redactions patterns work so we can assert a snapshot here
    // despite the generated uuid's (documentation is sparse :/)

    let unexisting_parent: SpecCommand = serde_json::from_value(json!(
      {"AddPathParameter": {"pathId": "path_2","parentPathId": "not-a-path","name": "todoId"}}
    ))
    .unwrap();
    let unexisting_parent_result = projection.execute(unexisting_parent);
    assert!(unexisting_parent_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_path_parameter_command__unexisting_parent_result",
      unexisting_parent_result.unwrap_err()
    );

    let unassignable_path_id: SpecCommand = serde_json::from_value(json!(
      {"AddPathParameter": {"pathId": "path_1","parentPathId": "path_1","name": "todoId"}}
    ))
    .unwrap();
    let unassignable_path_id_result = projection.execute(unassignable_path_id);
    assert!(unassignable_path_id_result.is_err());
    assert_debug_snapshot!(
      "can_handle_add_path_parameter_command__unassignable_path_id_result",
      unassignable_path_id_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_set_path_parameter_shape_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"PathParameterAdded": {"pathId": "path_2","parentPathId": "path_1","name": "todoId"}},
      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"",}}
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = SpecProjection::from(initial_events);

    let valid_command: SpecCommand = serde_json::from_value(json!(
      {"SetPathParameterShape":{"pathId":"path_2","shapedRequestParameterShapeDescriptor":{"shapeId":"string_shape_1","isRemoved":false}}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);

    let setting_root_path: SpecCommand = serde_json::from_value(json!(
      {"SetPathParameterShape":{"pathId":"root","shapedRequestParameterShapeDescriptor":{"shapeId":"string_shape_1","isRemoved":false}}}
    )).unwrap();
    let setting_root_path_result = projection.execute(setting_root_path);
    assert!(setting_root_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_path_parameter_shape_command__setting_root_path_result",
      setting_root_path_result.unwrap_err()
    );

    let unexisting_path: SpecCommand = serde_json::from_value(json!(
      {"SetPathParameterShape":{"pathId":"not-a-path","shapedRequestParameterShapeDescriptor":{"shapeId":"string_shape_1","isRemoved":false}}}
    )).unwrap();
    let unexisting_path_result = projection.execute(unexisting_path);
    assert!(unexisting_path_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_path_parameter_shape_command__unexisting_path_result",
      unexisting_path_result.unwrap_err()
    );

    let unexisting_shape: SpecCommand = serde_json::from_value(json!(
      {"SetPathParameterShape":{"pathId":"path_2","shapedRequestParameterShapeDescriptor":{"shapeId":"not_a_shape_id","isRemoved":false}}}
    )).unwrap();
    let unexisting_shape_result = projection.execute(unexisting_shape);
    assert!(unexisting_shape_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_path_parameter_shape_command__unexisting_shape_result",
      unexisting_shape_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_set_request_body_shape_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"RequestAdded": {"requestId": "request_1", "pathId": "path_1", "httpMethod": "POST"}},
      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"",}}
    ]))
    .expect("initial events should be valid endpoint events");

    let mut projection = SpecProjection::from(initial_events);

    let valid_command: SpecCommand = serde_json::from_value(json!(
      {"SetRequestBodyShape": {"requestId": "request_1", "bodyDescriptor": { "httpContentType": "application/json", "shapeId": "string_shape_1", "isRemoved": false }}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_set_request_body_shape_command__new_events",
      new_events
    );

    let unexisting_shape: SpecCommand = serde_json::from_value(json!(
      {"SetRequestBodyShape": {"requestId": "request_1", "bodyDescriptor": { "httpContentType": "application/json", "shapeId": "not-a-shape-id", "isRemoved": false }}}
    ))
    .unwrap();
    let unexisting_shape_result = projection.execute(unexisting_shape);
    assert!(unexisting_shape_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_request_body_shape_command__unexisting_shape_result",
      unexisting_shape_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn can_handle_set_response_body_shape_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"RequestAdded": {"requestId": "request_1", "pathId": "path_1", "httpMethod": "POST"}},
      {"ResponseAddedByPathAndMethod": {"responseId": "response_1", "pathId": "path_1", "httpMethod": "GET", "httpStatusCode": 200}},
      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"",}}
    ]))
    .expect("initial events should be valid endpoint events");

    let mut projection = SpecProjection::from(initial_events);

    let valid_command: SpecCommand = serde_json::from_value(json!(
      {"SetResponseBodyShape": {"responseId": "response_1", "bodyDescriptor": { "httpContentType": "application/json", "shapeId": "string_shape_1", "isRemoved": false }}}
    ))
    .expect("example command should be a valid command");

    let new_events = projection
      .execute(valid_command)
      .expect("valid command should yield new events");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_set_response_body_shape_command__new_events",
      new_events
    );

    let unexisting_shape: SpecCommand = serde_json::from_value(json!(
      {"SetResponseBodyShape": {"responseId": "response_1", "bodyDescriptor": { "httpContentType": "application/json", "shapeId": "not-a-shape-id", "isRemoved": false }}}
    ))
    .unwrap();
    let unexisting_shape_result = projection.execute(unexisting_shape);
    assert!(unexisting_shape_result.is_err());
    assert_debug_snapshot!(
      "can_handle_set_response_body_shape_command__unexisting_shape_result",
      unexisting_shape_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event); // verify this doesn't panic goes a long way to verifying the events
    }
  }

  #[test]
  pub fn spec_handler_provides_event_context_from_capture_context() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
    ]))
    .expect("initial events should be valid spec events");

    let mut command_handler = SpecCommandHandler::from(initial_events);

    let command_context = CommandContext::new(
      String::from("test-batch-1"),
      String::from("test-client-id"),
      String::from("test-client-session-id"),
      Utc.timestamp(0, 0),
    );

    command_handler.with_command_context(command_context.clone());

    let valid_command: SpecCommand = serde_json::from_value(json!(
      {"AddPathComponent": {"pathId": "path_2","parentPathId": "path_1","name": "completed"}}
    ))
    .expect("example command should be a valid command");

    let new_events = command_handler
      .execute(valid_command)
      .expect("valid command should yield new events");

    let new_event = match new_events.get(0) {
      Some(SpecEvent::EndpointEvent(EndpointEvent::PathComponentAdded(event))) => event,
      _ => unreachable!(
        "PathComponentAdded event should have been generated from AddPathComponent command"
      ),
    };

    assert!(new_event.event_context.is_some());
    let event_context = new_event.event_context.clone().unwrap();

    assert_eq!(event_context.client_id, command_context.client_id);
    assert_eq!(
      event_context.client_session_id,
      command_context.client_session_id
    );
    assert_eq!(
      event_context.client_command_batch_id,
      command_context.client_command_batch_id
    );
    assert_eq!(
      event_context.created_at,
      command_context.created_at.to_rfc3339()
    );

    assert_debug_snapshot!(
      "spec_handler_provides_event_context_from_capture_context",
      &new_event
    );
  }
}
