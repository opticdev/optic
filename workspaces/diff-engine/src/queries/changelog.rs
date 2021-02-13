use crate::projections::changelog::{ChangelogProjection, Endpoint};
use chrono::{DateTime, Utc};

pub struct ChangelogQuery {
  pub changelog: ChangelogProjection
}

impl ChangelogQuery {
  pub fn added(self, since: DateTime<Utc>) -> Vec<Endpoint> {
    self.changelog.endpoints
  }

  pub fn changed(self, since: DateTime<Utc>) -> Vec<Endpoint> {
    self.changelog.endpoints
  }
}