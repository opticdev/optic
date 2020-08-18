#![allow(dead_code)]

use cqrs_core::Event;
use serde::Deserialize;

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
