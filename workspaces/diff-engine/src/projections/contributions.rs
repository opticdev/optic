use crate::RfcEvent;
use cqrs_core::{Aggregate, AggregateEvent, Event};
use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct ContributionsProjection {
  // TODO check whether this is best ds to use
  pub hash_map: HashMap<String, HashMap<String, String>>,
}

impl ContributionsProjection {
  pub fn to_json_string(&self) -> String {
    serde_json::to_string(&self.hash_map).expect("hash map should be serializable")
  }

  pub fn with_contribution(&mut self, id: String, contribution_key: String, value: String) {
    self
      .hash_map
      .entry(id)
      .or_insert_with(|| HashMap::new())
      .insert(contribution_key, value);
  }
}

impl Default for ContributionsProjection {
  fn default() -> Self {
    ContributionsProjection {
      hash_map: HashMap::new(),
    }
  }
}

impl Aggregate for ContributionsProjection {
  fn aggregate_type() -> &'static str {
    "contributions_projection"
  }
}

impl<I> From<I> for ContributionsProjection
where
  I: IntoIterator,
  I::Item: AggregateEvent<Self>,
{
  fn from(events: I) -> Self {
    let mut projection = ContributionsProjection::default();
    for event in events.into_iter() {
      projection.apply(event);
    }
    projection
  }
}

// Events
impl AggregateEvent<ContributionsProjection> for RfcEvent {
  fn apply_to(self, projection: &mut ContributionsProjection) {
    match self {
      RfcEvent::ContributionAdded(e) => projection.with_contribution(e.id, e.key, e.value),
      _ => eprintln!(
        "Ignoring applying event of type '{}' for '{}'",
        self.event_type(),
        ContributionsProjection::aggregate_type()
      ),
    }
  }
}
