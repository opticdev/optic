use crate::projections::history::{CommitId, HistoryProjection, ROOT_COMMIT_ID};

pub struct HistoryQueries<'a> {
  history_projection: &'a HistoryProjection,
}

impl<'a> From<&'a HistoryProjection> for HistoryQueries<'a> {
  fn from(history_projection: &'a HistoryProjection) -> Self {
    HistoryQueries { history_projection }
  }
}

impl<'a> HistoryQueries<'a> {
  pub fn resolve_latest_batch_commit_id(&self) -> CommitId {
    let commit_id = self
      .history_projection
      .find_last_batch_commit_index()
      .map(|node_index| {
        self
          .history_projection
          .get_commit_id(&node_index)
          .map(|id| id.clone())
      })
      .flatten();

    commit_id.unwrap_or_else(|| CommitId::from(ROOT_COMMIT_ID))
  }
}
