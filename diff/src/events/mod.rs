#![allow(dead_code)]

pub use cqrs_core::{AggregateEvent, Event};
use serde::Deserialize;
use serde_json;
use std::fs;
use std::io;

pub mod endpoint;
pub mod http_interaction;
pub mod rfc;
pub mod shape;

pub use endpoint::EndpointEvent;
pub use http_interaction::HttpInteraction;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EventContext {
  client_id: String,
  client_session_id: String,
  client_command_batch_id: String,
  created_at: String,
}

#[derive(Deserialize)]
#[serde(untagged)]
pub enum SpecEvent {
  EndpointEvent(endpoint::EndpointEvent),
  RfcEvent(rfc::RfcEvent),
  ShapeEvent(shape::ShapeEvent),
}

impl Event for SpecEvent {
  fn event_type(&self) -> &'static str {
    match self {
      SpecEvent::EndpointEvent(evt) => evt.event_type(),
      SpecEvent::RfcEvent(evt) => evt.event_type(),
      SpecEvent::ShapeEvent(evt) => evt.event_type(),
    }
  }
}

impl SpecEvent {
  pub fn from_file(filename: &str) -> Result<Vec<SpecEvent>, EventLoadingError> {
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
