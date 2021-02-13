use cqrs_core::{Aggregate, AggregateEvent};
use chrono::{DateTime, Utc};
use crate::events::{SpecEvent};
use std::convert::From;

#[derive(Debug)]
pub struct Endpoint {
  pub path: String,
  pub happened_at: DateTime<Utc>
}

#[derive(Default, Debug)]
pub struct ChangelogProjection {
  pub endpoints: Vec<Endpoint>
}

impl Aggregate for ChangelogProjection {
  fn aggregate_type() -> &'static str {
    "changelog_projection"
  }
}

impl AggregateEvent<ChangelogProjection> for SpecEvent {
  fn apply_to(self, aggregate: &mut ChangelogProjection) {
    match self { _ => {}};
  }
}

impl From<Vec<SpecEvent>> for ChangelogProjection {
  fn from(events: Vec<SpecEvent>) -> Self {
    let mut changelog: ChangelogProjection = Default::default();
    for event in events {
      changelog.apply(event);
    }
    changelog
  }
}