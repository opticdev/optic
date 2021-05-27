use super::{EventContext, WithEventContext};
use crate::commands::rfc as rfc_commands;
use crate::commands::RfcCommand;
use cqrs_core::Event;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// RFC Events
// -----------
#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
pub enum RfcEvent {
  ContributionAdded(ContributionAdded),
  APINamed(APINamed),
  GitStateSet(GitStateSet),
  BatchCommitStarted(BatchCommitStarted),
  BatchCommitEnded(BatchCommitEnded),
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ContributionAdded {
  pub id: String,
  pub key: String,
  pub value: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct APINamed {
  name: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GitStateSet {
  branch_name: String,
  commit_id: String,
  event_context: Option<EventContext>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BatchCommitStarted {
  pub batch_id: String,
  pub commit_message: String,
  pub(crate) event_context: Option<EventContext>,

  #[serde(skip_serializing_if = "Option::is_none")]
  pub parent_id: Option<String>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BatchCommitEnded {
  pub batch_id: String,
  event_context: Option<EventContext>,
}

impl Event for RfcEvent {
  fn event_type(&self) -> &'static str {
    match self {
      RfcEvent::ContributionAdded(evt) => evt.event_type(),
      RfcEvent::APINamed(evt) => evt.event_type(),
      RfcEvent::GitStateSet(evt) => evt.event_type(),
      RfcEvent::BatchCommitStarted(evt) => evt.event_type(),
      RfcEvent::BatchCommitEnded(evt) => evt.event_type(),
    }
  }
}

impl WithEventContext for RfcEvent {
  fn with_event_context(&mut self, event_context: EventContext) {
    match self {
      RfcEvent::ContributionAdded(evt) => evt.event_context.replace(event_context),
      RfcEvent::APINamed(evt) => evt.event_context.replace(event_context),
      RfcEvent::GitStateSet(evt) => evt.event_context.replace(event_context),
      RfcEvent::BatchCommitStarted(evt) => evt.event_context.replace(event_context),
      RfcEvent::BatchCommitEnded(evt) => evt.event_context.replace(event_context),
    };
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

impl From<BatchCommitStarted> for RfcEvent {
  fn from(event: BatchCommitStarted) -> Self {
    Self::BatchCommitStarted(event)
  }
}

impl From<BatchCommitEnded> for RfcEvent {
  fn from(event: BatchCommitEnded) -> Self {
    Self::BatchCommitEnded(event)
  }
}

impl From<ContributionAdded> for RfcEvent {
  fn from(event: ContributionAdded) -> Self {
    Self::ContributionAdded(event)
  }
}

// Conversion from commands
// ------------------------

impl From<RfcCommand> for RfcEvent {
  fn from(rfc_command: RfcCommand) -> Self {
    match rfc_command {
      RfcCommand::StartBatchCommit(command) => RfcEvent::from(BatchCommitStarted::from(command)),
      RfcCommand::EndBatchCommit(command) => RfcEvent::from(BatchCommitEnded::from(command)),
      RfcCommand::AddContribution(command) => RfcEvent::from(ContributionAdded::from(command)),
      _ => unimplemented!(
        "conversion from rfc command to rfc event not implemented for variant: {:?}",
        rfc_command
      ),
    }
  }
}

impl From<rfc_commands::StartBatchCommit> for BatchCommitStarted {
  fn from(command: rfc_commands::StartBatchCommit) -> Self {
    Self {
      batch_id: command.batch_id,
      parent_id: Some(command.parent_id),
      commit_message: command.commit_message,
      event_context: None,
    }
  }
}

impl From<rfc_commands::EndBatchCommit> for BatchCommitEnded {
  fn from(command: rfc_commands::EndBatchCommit) -> Self {
    Self {
      batch_id: command.batch_id,
      event_context: None,
    }
  }
}

impl From<rfc_commands::AddContribution> for ContributionAdded {
  fn from(command: rfc_commands::AddContribution) -> Self {
    Self {
      id: command.id,
      key: command.key,
      value: command.value,
      event_context: None,
    }
  }
}
