use crate::projections::history::{CommitId, HistoryProjection};

pub struct HistoryQueries<'a> {
  history_projection: &'a HistoryProjection,
}

impl<'a> From<&'a HistoryProjection> for HistoryQueries<'a> {
  fn from(history_projection: &'a HistoryProjection) -> Self {
    HistoryQueries { history_projection }
  }
}

impl<'a> HistoryQueries<'a> {
  pub fn resolve_latest_batch_commit_id(&self) -> Option<&CommitId> {
    let node_index = self.history_projection.find_last_batch_commit_index()?;
    self.history_projection.get_commit_id(&node_index)
  }
}
