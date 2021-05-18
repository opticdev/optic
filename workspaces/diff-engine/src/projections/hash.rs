use crate::{RfcEvent, SpecEvent};
use cqrs_core::{Aggregate, AggregateEvent, Event};
use serde_hashkey::to_key;
use sha2::{Digest, Sha256};
use std::{collections::BTreeMap, hash::Hash};

#[derive(Debug, Clone)]
pub struct SpecHashProjection {
  hasher: Sha256,
}

impl SpecHashProjection {
  pub fn to_string(&self) -> String {
    format!("{:x}", self.hasher.clone().finalize())
  }

  pub fn with_event(&mut self, evt: SpecEvent) {
    let key = to_key(&evt).unwrap();
    let key_str = serde_json::to_string(&key).expect("should be able to serialize");

    self.hasher.update(key_str);
  }
}

impl Default for SpecHashProjection {
  fn default() -> Self {
    SpecHashProjection {
      hasher: Sha256::new(),
    }
  }
}

impl Aggregate for SpecHashProjection {
  fn aggregate_type() -> &'static str {
    "spec_hash_projection"
  }
}

impl<I> From<I> for SpecHashProjection
where
  I: IntoIterator,
  I::Item: AggregateEvent<Self>,
{
  fn from(events: I) -> Self {
    let mut projection = SpecHashProjection::default();
    for event in events.into_iter() {
      projection.apply(event);
    }
    projection
  }
}

// Events
impl AggregateEvent<SpecHashProjection> for SpecEvent {
  fn apply_to(self, projection: &mut SpecHashProjection) {
    projection.with_event(self);
  }
}
