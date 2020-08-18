use super::EventContext;
use cqrs_core::Event;
use serde::Deserialize;

// RFC Events
// -----------
#[derive(Deserialize)]
pub enum RfcEvent {
  ContributionAdded(ContributionAdded),
  APINamed(APINamed),
  GitStateSet(GitStateSet),
  BatchCommitStarted(BatchCommitStarted),
  BatchCommitEnded(BatchCommitEnded),
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ContributionAdded {
  id: String,
  key: String,
  value: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct APINamed {
  name: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitStateSet {
  branch_name: String,
  commit_id: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchCommitStarted {
  batch_id: String,
  commit_message: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BatchCommitEnded {
  batch_id: String,
  event_context: Option<EventContext>,
}

impl Event for RfcEvent {
  fn event_type(&self) -> &'static str {
    match *self {
      RfcEvent::ContributionAdded(ref evt) => evt.event_type(),
      RfcEvent::APINamed(ref evt) => evt.event_type(),
      RfcEvent::GitStateSet(ref evt) => evt.event_type(),
      RfcEvent::BatchCommitStarted(ref evt) => evt.event_type(),
      RfcEvent::BatchCommitEnded(ref evt) => evt.event_type(),
    }
  }
}

impl Event for ContributionAdded {
  fn event_type(&self) -> &'static str {
    "ContributionAdded"
  }
}

impl Event for APINamed {
  fn event_type(&self) -> &'static str {
    "APINamed"
  }
}

impl Event for GitStateSet {
  fn event_type(&self) -> &'static str {
    "GitStateSet"
  }
}

impl Event for BatchCommitStarted {
  fn event_type(&self) -> &'static str {
    "BatchCommitStarted"
  }
}

impl Event for BatchCommitEnded {
  fn event_type(&self) -> &'static str {
    "BatchCommitEnded"
  }
}
