use crate::events::SpecEvent;
use serde::Deserialize;
use uuid::Uuid;

#[derive(Deserialize, Debug, Clone)]
pub enum RfcCommand {
  AddContribution(AddContribution),
  SetAPIName(SetAPIName),
  SetGitState(SetGitState),
  MarkSetupStageComplete(MarkSetupStageComplete),
  StartBatchCommit(StartBatchCommit),
  EndBatchCommit(EndBatchCommit),

  #[serde(skip)]
  AppendBatch(AppendBatch),
}

impl RfcCommand {
  pub fn start_batch_commit(parent_id: String, commit_message: String) -> Self {
    let batch_id = Uuid::new_v4().to_hyphenated().to_string();

    Self::StartBatchCommit(StartBatchCommit {
      batch_id,
      parent_id,
      commit_message,
    })
  }
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AddContribution {
  id: String,
  key: String,
  value: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SetAPIName {
  new_name: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SetGitState {
  commit_id: String,
  branch_name: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct MarkSetupStageComplete {
  step: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct StartBatchCommit {
  pub batch_id: String,
  pub parent_id: String,
  pub commit_message: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EndBatchCommit {
  batch_id: String,
}

#[derive(Debug, Clone)]
pub struct AppendBatch {
  pub events: Vec<SpecEvent>,
  pub commit_message: String,
}

impl AppendBatch {
  pub fn into_events(self) -> Vec<SpecEvent> {
    self.events
  }
}
