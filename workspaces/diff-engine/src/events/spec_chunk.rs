use super::SpecEvent;
use cqrs_core::Event;
use serde_json;

#[derive(Debug)]
pub struct SpecChunkEvent {
  name: String,
  is_root: bool,
  parent_id: Option<String>,
  events: Vec<SpecEvent>,
}

impl Event for SpecChunkEvent {
  fn event_type(&self) -> &'static str {
    "spec_chunk_event"
  }
}

impl From<(String, bool, Vec<SpecEvent>)> for SpecChunkEvent {
  fn from((name, is_root, events): (String, bool, Vec<SpecEvent>)) -> Self {
    Self {
      name,
      is_root,
      events,
      parent_id: None, // TODO: determine parent id for each chunk
    }
  }
}
