pub mod endpoint;
pub mod shape;

pub use endpoint::EndpointProjection;
pub use shape::ShapeProjection;

use crate::events::SpecEvent;
use cqrs_core::{Aggregate, AggregateEvent};

pub struct SpecProjection {
  endpoint: endpoint::EndpointProjection,
  shape: shape::ShapeProjection,
}

impl Default for SpecProjection {
  fn default() -> Self {
    Self {
      endpoint: EndpointProjection::default(),
      shape: ShapeProjection::default(),
    }
  }
}

impl SpecProjection {
  pub fn endpoint(&self) -> &EndpointProjection {
    &self.endpoint
  }

  pub fn shape(&self) -> &ShapeProjection {
    &self.shape
  }
}

impl Aggregate for SpecProjection {
  fn aggregate_type() -> &'static str {
    "spec_projection"
  }
}

impl AggregateEvent<SpecProjection> for SpecEvent {
  fn apply_to(self, projection: &mut SpecProjection) {
    match self {
      SpecEvent::EndpointEvent(event) => projection.endpoint.apply(event),
      SpecEvent::ShapeEvent(event) => projection.shape.apply(event),
      _ => {}
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
