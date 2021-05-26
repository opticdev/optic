pub mod conflicts;
pub mod contributions;
pub mod endpoint;
pub mod history;
pub mod learners;
pub mod shape;
pub mod spec_events;
pub mod spectacle;

pub use conflicts::ConflictsProjection;
pub use contributions::ContributionsProjection;
pub use endpoint::{EndpointProjection, ResponseBodyDescriptor};
pub use history::{CommitId, HistoryProjection};
pub use learners::{
  shape_diff_affordances::LearnedShapeDiffAffordancesProjection,
  undocumented_bodies::LearnedUndocumentedBodiesProjection,
};
pub use shape::ShapeProjection;
pub use spec_events::{SpecAssemblerError, SpecAssemblerProjection};
pub use spectacle::endpoints::EndpointsProjection;

use crate::events::{EndpointEvent, RfcEvent, ShapeEvent, SpecEvent};
use cqrs_core::{Aggregate, AggregateCommand, AggregateEvent, CommandError};
use std::error::Error;

#[derive(Debug)]
pub struct SpecProjection {
  endpoint: endpoint::EndpointProjection,
  history: history::HistoryProjection,
  shape: shape::ShapeProjection,
  conflicts: conflicts::ConflictsProjection,
  spectacle_endpoints: spectacle::endpoints::EndpointsProjection,
  contributions: contributions::ContributionsProjection,
}

impl Default for SpecProjection {
  fn default() -> Self {
    Self {
      endpoint: EndpointProjection::default(),
      history: HistoryProjection::default(),
      shape: ShapeProjection::default(),
      conflicts: ConflictsProjection::default(),
      spectacle_endpoints: EndpointsProjection::default(),
      contributions: ContributionsProjection::default(),
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
  pub fn contributions(&self) -> &ContributionsProjection {
    &self.contributions
  }
  pub fn spectacle_endpoints(&self) -> &EndpointsProjection {
    &self.spectacle_endpoints
  }
  pub fn shapes_serializable(&self) -> crate::projections::shape::SerializableGraph {
    self.shape.to_serializable_graph()
  }
  pub fn spectacle_endpoints_serializable(
    &self,
  ) -> crate::projections::spectacle::endpoints::SerializableGraph {
    self.spectacle_endpoints.to_serializable_graph()
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
        projection.spectacle_endpoints.apply(event.clone());
        projection.conflicts.apply(event);
      }
      SpecEvent::ShapeEvent(event) => {
        projection.shape.apply(event.clone());
        projection.conflicts.apply(event);
      }
      SpecEvent::RfcEvent(event) => {
        projection.history.apply(event.clone());
        projection.shape.apply(event.clone());
        projection.spectacle_endpoints.apply(event.clone());
        projection.contributions.apply(event.clone());
      }
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

// Convient application of spec event variants
// -------------------------------------------
impl AggregateEvent<SpecProjection> for ShapeEvent {
  fn apply_to(self, projection: &mut SpecProjection) {
    projection.apply(SpecEvent::ShapeEvent(self))
  }
}

impl AggregateEvent<SpecProjection> for RfcEvent {
  fn apply_to(self, projection: &mut SpecProjection) {
    projection.apply(SpecEvent::RfcEvent(self))
  }
}

impl AggregateEvent<SpecProjection> for EndpointEvent {
  fn apply_to(self, projection: &mut SpecProjection) {
    projection.apply(SpecEvent::EndpointEvent(self))
  }
}
