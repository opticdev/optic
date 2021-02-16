use crate::projections::changelog::{ChangelogProjection, Endpoint};
use chrono::{DateTime, Utc};

pub struct ChangelogQuery {
  pub changelog: ChangelogProjection
}

impl ChangelogQuery {
  pub fn added(self, since: DateTime<Utc>) -> Vec<Endpoint> {
    let mut endpoints = self.changelog.endpoints.values()
      .filter(|e| e.added >= since)
      .cloned()
      .collect::<Vec<Endpoint>>();
    endpoints.sort_by(|a, b| a.added.cmp(&b.added));
    endpoints
  }
}