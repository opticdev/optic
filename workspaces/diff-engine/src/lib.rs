#![allow(dead_code, unused_imports, unused_variables)]

pub mod events;
pub mod interactions;
pub mod projections;
pub mod protos;
pub mod queries;
pub mod shapes;
pub mod state;

#[cfg(feature = "streams")]
pub mod streams;

pub use cqrs_core::Aggregate;
pub use events::{HttpInteraction, SpecChunkEvent, SpecEvent};
pub use interactions::diff as diff_interaction;
pub use interactions::result::InteractionDiffResult;
pub use projections::{
  EndpointProjection, ShapeProjection, SpecAssemblerProjection, SpecProjection,
};
pub use protos::shapehash;
pub use shapes::diff as diff_shape;
pub use state::body::BodyDescriptor;

pub mod errors {
  pub use super::events::EventLoadingError;
}
