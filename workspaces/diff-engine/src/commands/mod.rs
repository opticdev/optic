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
        let endpoint_events = spec_projection
          .endpoint()
          .execute(EndpointCommand::SetPathParameterShape(command.clone()))?;

        vec![]
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
