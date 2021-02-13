use crate::projections::changelog::{ChangelogProjection, Endpoint};
use chrono::{DateTime, Utc};

pub struct ChangelogQuery {
  pub changelog: ChangelogProjection
}

impl ChangelogQuery {
  pub fn added(self, since: DateTime<Utc>) -> Vec<Endpoint> {
    self.changelog.endpoints.values()
      .filter(|e| e.added >= since)
      .cloned().collect()
  }
}