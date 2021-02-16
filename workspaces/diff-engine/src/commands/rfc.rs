use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub enum RfcCommand {
  AddContribution(AddContribution),
  SetAPIName(SetAPIName),
  SetGitState(SetGitState),
  MarkSetupStageComplete(MarkSetupStageComplete),
  StartBatchCommit(StartBatchCommit),
  EndBatchCommit(EndBatchCommit),
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
  batch_id: String,
  commit_message: String,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EndBatchCommit {
  batch_id: String,
}
