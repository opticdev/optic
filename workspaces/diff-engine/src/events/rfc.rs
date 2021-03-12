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
  id: String,
  key: String,
  value: String,
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
  event_context: Option<EventContext>,

  #[serde(skip_serializing_if = "Option::is_none")]
  pub parent_id: Option<String>,
}

#[derive(Deserialize, Debug, PartialEq, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct BatchCommitEnded {
  pub batch_id: String,
  event_context: Option<EventContext>,
}

cqrs_event!(RfcEvent {
  ContributionAdded => "ContributionAdded",
  APINamed => "APINamed",
  GitStateSet => "GitStateSet",
  BatchCommitStarted => "BatchCommitStarted",
  BatchCommitEnded => "BatchCommitEnded"
});

// Conversion from commands
// ------------------------

impl From<RfcCommand> for RfcEvent {
  fn from(rfc_command: RfcCommand) -> Self {
    match rfc_command {
      RfcCommand::StartBatchCommit(command) => RfcEvent::from(BatchCommitStarted::from(command)),
      RfcCommand::EndBatchCommit(command) => RfcEvent::from(BatchCommitEnded::from(command)),
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
