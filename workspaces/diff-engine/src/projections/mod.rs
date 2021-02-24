pub mod conflicts;
pub mod endpoint;
pub mod history;
pub mod shape;
pub mod spec_events;

pub use conflicts::ConflictsProjection;
pub use endpoint::EndpointProjection;
pub use history::{CommitId, HistoryProjection};
pub use shape::ShapeProjection;
pub use spec_events::{SpecAssemblerError, SpecAssemblerProjection};

use crate::events::SpecEvent;
use cqrs_core::{Aggregate, AggregateCommand, AggregateEvent, CommandError};
use std::error::Error;

#[derive(Debug)]
pub struct SpecProjection {
  endpoint: endpoint::EndpointProjection,
  history: history::HistoryProjection,
  shape: shape::ShapeProjection,
  conflicts: conflicts::ConflictsProjection,
}

impl Default for SpecProjection {
  fn default() -> Self {
    Self {
      endpoint: EndpointProjection::default(),
      history: HistoryProjection::default(),
      shape: ShapeProjection::default(),
      conflicts: ConflictsProjection::default(),
    }
  }
}

impl SpecProjection {
  pub fn endpoint(&self) -> &EndpointProjection {
    &self.endpoint
  }

  pub fn history(&self) -> &HistoryProjection {
    &self.history
  }

  pub fn shape(&self) -> &ShapeProjection {
    &self.shape
  }
  pub fn conflicts(&self) -> &ConflictsProjection {
    &self.conflicts
  }
}

impl Aggregate for SpecProjection {
  fn aggregate_type() -> &'static str {
    "spec_projection"
  }
}

// Events
// ------

impl AggregateEvent<SpecProjection> for SpecEvent {
  fn apply_to(self, projection: &mut SpecProjection) {
    match self {
      SpecEvent::EndpointEvent(event) => {
        projection.endpoint.apply(event.clone());
        projection.conflicts.apply(event);
      }
      SpecEvent::ShapeEvent(event) => {
        projection.shape.apply(event.clone());
        projection.conflicts.apply(event);
      }
      SpecEvent::RfcEvent(event) => projection.history.apply(event),
    }
  }
}

impl AggregateEvent<HistoryProjection> for SpecEvent {
  fn apply_to(self, projection: &mut HistoryProjection) {
    if let SpecEvent::RfcEvent(event) = self {
      event.apply_to(projection);
    }
  }
}

impl<I> From<I> for SpecProjection
where
  I: IntoIterator,
  I::Item: AggregateEvent<Self>,
{
  fn from(events: I) -> Self {
    let mut projection = SpecProjection::default();
    for event in events.into_iter() {
      projection.apply(event);
    }
    projection
  }
}
