pub use serde::Deserialize;

pub mod endpoint;
pub mod rfc;
pub mod shape;

use crate::events::SpecEvent;
use crate::projections::SpecProjection;
use cqrs_core::{Aggregate, AggregateCommand};
pub use endpoint::EndpointCommand;
pub use rfc::RfcCommand;
pub use shape::ShapeCommand;

#[derive(Deserialize, Debug, Clone)]
#[serde(untagged)]
pub enum SpecCommand {
  EndpointCommand(EndpointCommand),
  RfcCommand(RfcCommand),
  ShapeCommand(ShapeCommand),
}

// Errors
// ------

#[derive(Debug)]
pub enum SpecCommandError {
  Other(&'static str),
  Validation(String),
  Unimplemented(SpecCommand),
}

impl std::fmt::Display for SpecCommandError {
  fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
    f.write_str(&self.to_string())
  }
}

impl std::error::Error for SpecCommandError {}

// CommandContext
// --------------

#[derive(Deserialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CommandContext {
  pub client_id: String,
  pub client_session_id: String,
  pub client_command_batch_id: String,
}

// Command handling
// ----------------

impl AggregateCommand<SpecProjection> for SpecCommand {
  type Error = SpecCommandError;
  type Event = SpecEvent;
  type Events = Vec<SpecEvent>;

  fn execute_on(self, spec_projection: &SpecProjection) -> Result<Self::Events, Self::Error> {
    let events = match self {
      SpecCommand::EndpointCommand(EndpointCommand::SetPathParameterShape(command)) => {
        spec_projection
          .shape()
          .execute(EndpointCommand::SetPathParameterShape(command.clone()))?; // validate shape exists
        let endpoint_events = spec_projection
          .endpoint()
          .execute(EndpointCommand::SetPathParameterShape(command.clone()))?;

        endpoint_events
          .into_iter()
          .map(|endpoint_event| SpecEvent::EndpointEvent(endpoint_event))
          .collect::<Vec<_>>()
      }

      // endpoint commands that can be purely handled by the endpoint projection
      SpecCommand::EndpointCommand(endpoint_command) => spec_projection
        .endpoint()
        .execute(endpoint_command)?
        .into_iter()
        .map(|endpoint_event| SpecEvent::EndpointEvent(endpoint_event))
        .collect::<Vec<_>>(),

      _ => Err(SpecCommandError::Unimplemented(self))?,
    };
    Ok(events)
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use insta::assert_debug_snapshot;
  use serde_json::json;

  #[test]
  pub fn can_handle_set_path_parameter_shape_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"PathParameterAdded": {"pathId": "path_2","parentPathId": "path_1","name": "todoId"}},
      {"ShapeAdded":{"shapeId":"string_shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":"",}}
    ]))
    .expect("initial events should be valid spec events");

    let projection = SpecProjection::from(initial_events);

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
  }
}
