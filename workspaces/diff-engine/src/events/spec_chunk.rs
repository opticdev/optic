use super::{RfcEvent, SpecEvent};
use cqrs_core::Event;
use serde_json;

#[derive(Debug)]
pub struct SpecChunkEvent {
  pub id: Option<String>,
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
    let (id, parent_id) = if is_root {
      (Some(String::from("root")), None)
    } else {
      let first_event = events.first();

      first_event
        .map(|first_event| match first_event {
          SpecEvent::RfcEvent(RfcEvent::BatchCommitStarted(e)) => {
            (Some(e.batch_id.clone()), e.parent_id.clone())
          }
          _ => (None, None),
        })
        .unwrap_or((None, None))
    };

    Self {
      id,
      name,
      is_root,
      events,
      parent_id,
    }
  }
}
