use super::{RfcEvent, SpecEvent};
use cqrs_core::Event;
use serde_json;

#[derive(Debug)]
pub struct SpecChunkEvent {
  pub name: String,
  pub is_root: bool,
  pub parent_id: Option<String>,
  pub events: Vec<SpecEvent>,
}

impl Event for SpecChunkEvent {
  fn event_type(&self) -> &'static str {
    "spec_chunk_event"
  }
}

impl From<(String, bool, Vec<SpecEvent>)> for SpecChunkEvent {
  fn from((name, is_root, events): (String, bool, Vec<SpecEvent>)) -> Self {
    let parent_id = if is_root {
      None
    } else {
      events
        .first()
        .map(|first_event| match first_event {
          SpecEvent::RfcEvent(RfcEvent::BatchCommitStarted(e)) => e.parent_id.clone(),
          _ => None,
        })
        .flatten()
    };

    Self {
      name,
      is_root,
      events,
      parent_id,
    }
  }
}
