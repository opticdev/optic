use crate::events::SpecChunkEvent;

use cqrs_core::{Aggregate, AggregateEvent};
use std::collections::HashMap;

#[derive(Debug)]
pub struct SpecAssemblerProjection {
  root_chunk: Option<SpecChunkEvent>,
  chunks_by_parent_id: HashMap<String, SpecChunkEvent>,
}

impl Default for SpecAssemblerProjection {
  fn default() -> Self {
    Self {
      root_chunk: None,
      chunks_by_parent_id: HashMap::new(),
    }
  }
}

impl Aggregate for SpecAssemblerProjection {
  fn aggregate_type() -> &'static str {
    "spec_assembler_projection"
  }
}

impl AggregateEvent<SpecAssemblerProjection> for SpecChunkEvent {
  fn apply_to(self, projection: &mut SpecAssemblerProjection) {}
}
