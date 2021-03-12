#![allow(dead_code)]

use chrono::{DateTime, Local, TimeZone, Utc};
pub use cqrs_core::{AggregateEvent, Event};
use serde::{Deserialize, Serialize, Serializer};
use serde_json;
use std::fs;
use std::io;
use std::path::Path;

#[macro_use]
mod macros;

pub mod endpoint;
pub mod http_interaction;
pub mod rfc;
pub mod shape;
pub mod spec_chunk;

pub use endpoint::EndpointEvent;
pub use http_interaction::HttpInteraction;
pub use rfc::RfcEvent;
pub use shape::ShapeEvent;
pub use spec_chunk::SpecChunkEvent;

use crate::CommandContext;

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(untagged)]
pub enum SpecEvent {
  EndpointEvent(endpoint::EndpointEvent),
  RfcEvent(rfc::RfcEvent),
  ShapeEvent(shape::ShapeEvent),
}

cqrs_event!(SpecEvent {
  EndpointEvent,
  RfcEvent,
  ShapeEvent
});

impl SpecEvent {
  pub fn from_file(filename: impl AsRef<Path>) -> Result<Vec<SpecEvent>, EventLoadingError> {
    let file_contents = fs::read_to_string(filename)?;

    let events: Vec<SpecEvent> = serde_json::from_str(&file_contents)?;

    Ok(events)
  }
}

#[derive(Debug)]
pub enum EventLoadingError {
  Avro(avro_rs::Error),
  Io(io::Error),
  Json(serde_json::Error),
}

impl From<io::Error> for EventLoadingError {
  fn from(err: io::Error) -> EventLoadingError {
    EventLoadingError::Io(err)
  }
}

impl From<serde_json::Error> for EventLoadingError {
  fn from(err: serde_json::Error) -> EventLoadingError {
    use serde_json::error::Category;
    match err.classify() {
      Category::Io => EventLoadingError::Io(err.into()),
      Category::Syntax | Category::Data | Category::Eof => EventLoadingError::Json(err),
    }
  }
}

impl From<avro_rs::Error> for EventLoadingError {
  fn from(err: avro_rs::Error) -> EventLoadingError {
    EventLoadingError::Avro(err)
  }
}

// EventContext
// ------------

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EventContext {
  pub client_id: String,
  pub client_session_id: String,
  pub client_command_batch_id: String,

  #[serde(serialize_with = "created_at_to_local_timezone")]
  pub created_at: String,
}

fn created_at_to_local_timezone<S>(created_at: &String, serializer: S) -> Result<S::Ok, S::Error>
where
  S: Serializer,
{
  if let Ok(parsed_date) = DateTime::parse_from_rfc3339(created_at) {
    let local = parsed_date.with_timezone(&Local);
    serializer.serialize_str(&local.to_rfc3339())
  } else {
    serializer.serialize_str(&created_at)
  }
}

impl From<CommandContext> for EventContext {
  fn from(command_context: CommandContext) -> Self {
    Self {
      client_id: command_context.client_id,
      client_session_id: command_context.client_session_id,
      client_command_batch_id: command_context.client_command_batch_id,
      created_at: command_context.created_at.to_rfc3339(),
    }
  }
}

pub trait WithEventContext {
  fn with_event_context(&mut self, event_context: EventContext);
}
