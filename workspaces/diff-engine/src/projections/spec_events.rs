use crate::events::spec_chunk::{BatchChunkEvent, RootChunkEvent};
use crate::events::SpecChunkEvent;

use cqrs_core::{Aggregate, AggregateEvent};
use std::collections::HashMap;

#[derive(Debug)]
pub struct SpecAssemblerProjection {
  root_chunk: Option<RootChunkEvent>,
  chunks_by_parent_id: HashMap<String, Vec<BatchChunkEvent>>,
}

impl Default for SpecAssemblerProjection {
  fn default() -> Self {
    Self {
      root_chunk: None,
      chunks_by_parent_id: HashMap::new(),
    }
  }
}

impl SpecAssemblerProjection {
  pub fn with_root_chunk(&mut self, chunk: RootChunkEvent) {
    if self.root_chunk.is_some() {
      panic!("SpecAssemblerProjection cannot handle applying more than a single root chunk");
    }
    self.root_chunk = Some(chunk);
  }

  pub fn with_batch_chunk(&mut self, chunk: BatchChunkEvent) {
    let batch_chunks_for_parent = self
      .chunks_by_parent_id
      .entry(chunk.parent_id.clone())
      .or_insert_with(|| Vec::new());

    batch_chunks_for_parent.push(chunk);
  }
}

impl Aggregate for SpecAssemblerProjection {
  fn aggregate_type() -> &'static str {
    "spec_assembler_projection"
  }
}

impl AggregateEvent<SpecAssemblerProjection> for SpecChunkEvent {
  fn apply_to(self, projection: &mut SpecAssemblerProjection) {
    match self {
      SpecChunkEvent::Root(chunk) => projection.with_root_chunk(chunk),
      SpecChunkEvent::Batch(chunk) => projection.with_batch_chunk(chunk),
      SpecChunkEvent::Unknown(chunk) => {
        dbg!(
          "ignored chunk in application to SpecAssemblerProjection",
          chunk
        );
      }
    }
  }
}
