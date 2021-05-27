use crate::events::spec_chunk::{BatchChunkEvent, RootChunkEvent};
use crate::events::SpecChunkEvent;
use crate::SpecEvent;
use std::error::Error;
use std::fmt;

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

  // TODO: implement returning of an Iterator instead of Vec
  pub fn into_events(self) -> Result<Vec<SpecEvent>, SpecAssemblerError> {
    let root_chunk = self
      .root_chunk
      .ok_or_else(|| SpecAssemblerError::RootChunkRequired)?;

    let mut current_chunk_id = root_chunk.last_batch_id().clone();
    let mut chunks = vec![SpecChunkEvent::Root(root_chunk)];
    let mut chunks_by_parent_id = self.chunks_by_parent_id;

    loop {
      let children = chunks_by_parent_id.remove(&current_chunk_id);
      if let None = children {
        break;
      }
      let mut children = children.unwrap();

      if children.len() != 1 {
        // if there are multiple children to a parent
        break; // TODO: decide whether for this projection we need to do anything more
      }
      let child_chunk = children.pop().unwrap();

      current_chunk_id = child_chunk.id.clone();
      chunks.push(SpecChunkEvent::Batch(child_chunk));
    }

    let events = chunks
      .into_iter()
      .flat_map(|chunk| chunk.into_events_iter());

    Ok(events.collect())
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
          chunk.name,
          chunk.events.len()
        );
      }
    }
  }
}

impl<I> From<I> for SpecAssemblerProjection
where
  I: IntoIterator,
  I::Item: AggregateEvent<Self>,
{
  fn from(events: I) -> Self {
    let mut projection = SpecAssemblerProjection::default();
    for event in events.into_iter() {
      projection.apply(event);
    }
    projection
  }
}

// SpecAssemblerError
// ------------------

#[derive(Debug)]
pub enum SpecAssemblerError {
  RootChunkRequired,
}

impl fmt::Display for SpecAssemblerError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    let msg = match self {
      SpecAssemblerError::RootChunkRequired => "Root chunk required to assemble events",
    };
    write!(f, "SpecAssemblerError: {}", msg)
  }
}

impl Error for SpecAssemblerError {}
