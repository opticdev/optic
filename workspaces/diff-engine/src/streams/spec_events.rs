use super::JsonLineEncoder;
use crate::events::{EventLoadingError, SpecChunkEvent, SpecEvent};
use crate::projections::{SpecAssemblerError, SpecAssemblerProjection};
use futures::sink::Sink;
use serde::Serialize;
use std::path::Path;
use tokio::io::{AsyncWrite, BufWriter};
use tokio::{fs::read_to_string, io::AsyncReadExt};
use tokio_util::codec::FramedWrite;

// TODO: return a stream instead of a Vec
pub async fn from_file(path: impl AsRef<Path>) -> Result<Vec<SpecEvent>, EventLoadingError> {
  let file_contents = read_to_string(path).await?;

  let events: Vec<SpecEvent> = serde_json::from_str(&file_contents)?;

  Ok(events)
}

pub async fn from_spec_chunks(
  chunks: Vec<SpecChunkEvent>,
) -> Result<Vec<SpecEvent>, SpecAssemblerError> {
  let spec_assembler = SpecAssemblerProjection::from(chunks);

  spec_assembler.into_events()
}

pub fn into_json_lines<S>(sink: S) -> impl Sink<SpecEvent>
where
  S: AsyncWrite,
{
  let writer = BufWriter::new(sink);
  let codec = JsonLineEncoder::new();
  FramedWrite::new(writer, codec)
}
