use super::SpecEvent;
use cqrs_core::Event;

#[derive(Debug)]
pub struct SpecChunkEvent {
  parent_id: Option<String>,
  events: Vec<SpecEvent>,
}

impl Event for SpecChunkEvent {
  fn event_type(&self) -> &'static str {
    "spec_chunk_event"
  }
}
