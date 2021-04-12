use super::{CommandContext, SpecCommand, SpecCommandError};
use crate::events::rfc as rfc_events;
use crate::events::RfcEvent;
use crate::projections::{CommitId, HistoryProjection};
use crate::queries::history::HistoryQueries;
use cqrs_core::AggregateCommand;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug, Clone, Serialize)]
pub enum RfcCommand {
  AddContribution(AddContribution),
  SetAPIName(SetAPIName),
  SetGitState(SetGitState),
  MarkSetupStageComplete(MarkSetupStageComplete),

  #[serde(skip)]
  StartBatchCommit(StartBatchCommit),
  #[serde(skip)]
  EndBatchCommit(EndBatchCommit),
  #[serde(skip)]
  AppendBatch(AppendBatch),
}

impl RfcCommand {
  pub fn append_batch_commit(batch_id: String, commit_message: String) -> Self {
    Self::AppendBatch(AppendBatch {
      batch_id,
      commit_message,
    })
  }

  pub fn start_batch_commit(batch_id: String, parent_id: String, commit_message: String) -> Self {
    Self::StartBatchCommit(StartBatchCommit {
      batch_id,
      parent_id,
      commit_message,
    })
  }

  pub fn end_batch_commit(batch_id: String) -> Self {
    Self::EndBatchCommit(EndBatchCommit { batch_id })
  }

  pub fn add_contribution(id: String, key: String, value: String) -> Self {
    Self::AddContribution(AddContribution { id, key, value })
  }
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AddContribution {
  pub id: String,
  pub key: String,
  pub value: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetAPIName {
  new_name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SetGitState {
  commit_id: String,
  branch_name: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MarkSetupStageComplete {
  step: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StartBatchCommit {
  pub batch_id: String,
  pub parent_id: String,
  pub commit_message: String,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EndBatchCommit {
  pub batch_id: String,
}

#[derive(Debug, Clone)]
pub struct AppendBatch {
  pub batch_id: String,
  pub commit_message: String,
}

// ComandHandling
// --------------

impl AggregateCommand<HistoryProjection> for RfcCommand {
  type Error = SpecCommandError;
  type Event = RfcEvent;
  type Events = Vec<RfcEvent>;

  fn execute_on(self, history_projection: &HistoryProjection) -> Result<Self::Events, Self::Error> {
    let validation = CommandValidationQueries::from((history_projection, &self));

    let events = match self {
      RfcCommand::AppendBatch(command) => {
        let parent_batch_id = {
          let history_queries = HistoryQueries::from(history_projection);
          history_queries.resolve_latest_batch_commit_id()
        };

        vec![RfcEvent::from(RfcCommand::start_batch_commit(
          command.batch_id.clone(),
          parent_batch_id,
          command.commit_message.clone(),
        ))]
      }

      RfcCommand::EndBatchCommit(command) => {
        validation.require(
          validation.batch_commit_id_exists(&command.batch_id),
          "batch commit must exist to end batch commit",
        )?;
        validation.require(
          !validation.batch_commit_completed(&command.batch_id),
          "batch commit can not have ended yet to end batch commit",
        )?;

        vec![RfcEvent::from(rfc_events::BatchCommitEnded::from(command))]
      }

      RfcCommand::AddContribution(command) => {
        vec![RfcEvent::from(rfc_events::ContributionAdded::from(command))]
      }

      _ => Err(SpecCommandError::Unimplemented(
        "rfc command not implemented for rfc projection",
        SpecCommand::RfcCommand(self),
      ))?,
    };

    Ok(events)
  }
}

struct CommandValidationQueries<'a> {
  command_description: String,
  history_projection: &'a HistoryProjection,
}

impl<'a> CommandValidationQueries<'a> {
  fn require(&self, condition: bool, msg: &'static str) -> Result<(), SpecCommandError> {
    if condition {
      Ok(())
    } else {
      Err(SpecCommandError::Validation(format!(
        "Command failed validation: {}, {:?}",
        msg, self.command_description
      )))
    }
  }

  pub fn batch_commit_id_exists(&self, commit_id: &CommitId) -> bool {
    self
      .history_projection
      .get_batch_commit_node_index(commit_id)
      .is_some()
  }

  pub fn batch_commit_completed(&self, commit_id: &CommitId) -> bool {
    let descriptor = self
      .history_projection
      .get_batch_commit_descriptor(commit_id);
    descriptor.is_some() && descriptor.unwrap().is_complete
  }
}

impl<'a> From<(&'a HistoryProjection, &RfcCommand)> for CommandValidationQueries<'a> {
  fn from((history_projection, rfc_command): (&'a HistoryProjection, &RfcCommand)) -> Self {
    Self {
      command_description: format!("{:?}", rfc_command),
      history_projection,
    }
  }
}

#[cfg(test)]
mod test {
  use super::*;
  use crate::events::SpecEvent;
  use cqrs_core::Aggregate;
  use insta::assert_debug_snapshot;
  use serde_json::json;

  #[test]
  pub fn can_handle_append_batch_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"BatchCommitStarted": {"batchId": "batch_1", "commitMessage": "initial commit"}},
      {"BatchCommitEnded": {"batchId": "batch_1" }}
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = HistoryProjection::from(initial_events);

    let command: RfcCommand =
      RfcCommand::append_batch_commit(String::from("test-batch-1"), String::from("second commit"));

    let new_events = projection
      .execute(command)
      .expect("new command should be applicable to initial projection");
    assert_eq!(new_events.len(), 1);
    // TODO: snapshot the results instead, once we figure out how insta redactions can control
    // for the automatically generated batch id.
    assert!(matches!(new_events[0], RfcEvent::BatchCommitStarted(_)));
    let parent_id = match &new_events[0] {
      RfcEvent::BatchCommitStarted(batch_start) => batch_start.parent_id.clone().unwrap(),
      _ => unreachable!(),
    };
    assert_eq!(parent_id, "batch_1");
    // assert_debug_snapshot!("can_handle_append_batch_command__new_events", new_events);

    for event in new_events {
      projection.apply(event);
    }
  }

  #[test]
  pub fn can_handle_end_batch_commit_command() {
    let initial_events: Vec<SpecEvent> = serde_json::from_value(json!([
      {"PathComponentAdded": {"pathId": "path_1","parentPathId": "root","name": "todos"}},
      {"BatchCommitStarted": {"batchId": "batch_1","parentId": "root", "commitMessage": "initial commit"}},
      {"BatchCommitEnded": {"batchId": "batch_1" }},
      {"BatchCommitStarted": {"batchId": "batch_2","parentId": "batch_1", "commitMessage": "second commit"}},
    ]))
    .expect("initial events should be valid spec events");

    let mut projection = HistoryProjection::from(initial_events);

    let command: RfcCommand = RfcCommand::end_batch_commit(String::from("batch_2"));

    let new_events = projection
      .execute(command)
      .expect("new command should be applicable to initial projection");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_end_batch_commit_command__new_events",
      new_events
    );

    let unexisting_batch: RfcCommand = RfcCommand::end_batch_commit(String::from("not-a-batch"));
    let unexisting_batch_result = projection.execute(unexisting_batch);
    assert!(unexisting_batch_result.is_err());
    assert_debug_snapshot!(
      "can_handle_end_batch_commit_command__unexisting_batch_result",
      unexisting_batch_result.unwrap_err()
    );

    let already_ended_batch: RfcCommand = RfcCommand::end_batch_commit(String::from("batch_1"));
    let already_ended_batch_result = projection.execute(already_ended_batch);
    assert!(already_ended_batch_result.is_err());
    assert_debug_snapshot!(
      "can_handle_end_batch_commit_command__already_ended_batch_result",
      already_ended_batch_result.unwrap_err()
    );

    for event in new_events {
      projection.apply(event);
    }
  }

  #[test]
  pub fn can_handle_contribution_commands() {
    let initial_events: Vec<SpecEvent> =
      serde_json::from_value(json!([])).expect("initial events should be valid spec events");

    let projection = HistoryProjection::from(initial_events);

    let command: RfcCommand = RfcCommand::add_contribution(
      String::from("path123.method"),
      String::from("purpose"),
      String::from("Name of Endpoint"),
    );

    let new_events = projection
      .execute(command)
      .expect("new contributions should be applicable projection");
    assert_eq!(new_events.len(), 1);
    assert_debug_snapshot!(
      "can_handle_add_contribution_command__new_events",
      new_events
    );
  }
}
