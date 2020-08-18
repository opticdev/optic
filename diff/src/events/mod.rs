#![allow(dead_code)]

use cqrs_core::Event;
use serde::Deserialize;
use serde_json;
use std::fs;
use std::io;

pub mod endpoint;
pub mod rfc;
pub mod shape;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct EventContext {
  client_id: String,
  client_session_id: String,
  client_command_batch_id: String,
  created_at: String,
}

#[derive(Deserialize)]
#[serde(untagged)]
pub enum OpticEvent {
  EndpointEvent(endpoint::EndpointEvent),
  RfcEvent(rfc::RfcEvent),
  ShapeEvent(shape::ShapeEvent),
}

impl Event for OpticEvent {
  fn event_type(&self) -> &'static str {
    match *self {
      OpticEvent::EndpointEvent(ref evt) => evt.event_type(),
      OpticEvent::RfcEvent(ref evt) => evt.event_type(),
      OpticEvent::ShapeEvent(ref evt) => evt.event_type(),
    }
  }
}

pub fn from_file(filename: &str) -> Result<Vec<OpticEvent>, EventLoadingError> {
  let file_contents =
    fs::read_to_string(filename).expect(&format!("File at {} could not be read", &filename));

  let events: Vec<OpticEvent> = serde_json::from_str(&file_contents)?;

  Ok(events)
}

#[derive(Debug)]
pub enum EventLoadingError {
  Io(io::Error),
  Json(serde_json::Error),
}

// We only have to implement this trait for serde_json::Error as handle conversion from the io::Error
impl From<serde_json::Error> for EventLoadingError {
  fn from(err: serde_json::Error) -> EventLoadingError {
    use serde_json::error::Category;
    match err.classify() {
      Category::Io => EventLoadingError::Io(err.into()),
      Category::Syntax | Category::Data | Category::Eof => EventLoadingError::Json(err),
    }
  }
}
