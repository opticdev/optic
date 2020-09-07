#![allow(dead_code, unused_imports, unused_variables)]

mod events;
mod interactions;
mod projections;
mod queries;
mod shapes;
mod state;
pub mod streams;

pub use cqrs_core::Aggregate;
pub use events::{HttpInteraction, SpecEvent};
pub use interactions::diff as diff_interaction;
pub use interactions::diff::InteractionDiffResult;
pub use projections::{endpoint::EndpointProjection, shape::ShapeProjection};
pub use shapes::diff as diff_shape;

pub mod errors {
  pub use super::events::EventLoadingError;
}
