#![allow(dead_code, unused_imports, unused_variables)]

mod commands;
mod events;
mod interactions;
mod learn_shape;
mod projections;
mod protos;
mod queries;
mod shapes;
mod spec;
mod state;

#[cfg(feature = "streams")]
pub mod streams;

pub use commands::{CommandContext, EndpointCommand, RfcCommand, SpecCommand, SpecCommandHandler};
pub use cqrs_core::Aggregate;
pub use events::{
  http_interaction::{
    ArbitraryData, Body, HttpInteraction, QueryParametersData, Request, Response,
  },
  RfcEvent, SpecChunkEvent, SpecEvent,
};
pub use interactions::result::{BodyAnalysisLocation, BodyAnalysisResult, InteractionDiffResult};
pub use interactions::{
  analyze_documented_bodies, analyze_undocumented_bodies, AnalyzeUndocumentedBodiesConfig,
};
pub use interactions::{diff as diff_interaction, DiffConfig as DiffInteractionConfig};
pub use learn_shape::{TrailObservationsResult, TrailValues};
pub use projections::{
  EndpointProjection, LearnedShapeDiffAffordancesProjection, LearnedUndocumentedBodiesProjection,
  ResponseBodyDescriptor, ShapeProjection, SpecAssemblerProjection, SpecProjection,
};
pub use protos::shapehash;
pub use queries::endpoint::EndpointQueries;
pub use queries::shape::ShapeQueries;
pub use queries::spectacle::spec_choices::{JsonType, ShapeChoiceQueries};
pub use shapes::{diff as diff_shape, JsonTrail};
pub use spec::append_batch as append_batch_to_spec;
pub use state::endpoint::ResponseId;
pub use state::{body::BodyDescriptor, SpecIdGenerator, TaggedInput, Tags};

pub mod errors {
  pub use super::events::EventLoadingError;

  #[cfg(feature = "streams")]
  pub use super::streams::spec_chunks::{SpecChunkLoaderError, SpecChunkWriterError};
}
