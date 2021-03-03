use super::JsonLineEncoder;
use crate::events::{EventLoadingError, SpecChunkEvent, SpecEvent};
use crate::projections::{SpecAssemblerError, SpecAssemblerProjection};
use futures::sink::{Sink, SinkExt};
use futures::stream::{Stream, StreamExt};
use serde::Serialize;
use std::path::Path;
use tokio::io::{
  AsyncBufReadExt, AsyncRead, AsyncWrite, AsyncWriteExt, BufReader, BufWriter, Lines,
};
use tokio::{fs::read_to_string, io::AsyncReadExt};
use tokio_stream::wrappers::LinesStream;
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

pub fn from_json_lines<R>(source: R) -> LinesStream<BufReader<R>>
where
  R: AsyncRead,
{
  // 10 megabytes of capacity, to deal with unbound nature of request and response bodies
  let reader = BufReader::with_capacity(10 * 1024 * 1024, source);
  LinesStream::new(reader.lines())
}

pub fn into_json_lines<S>(sink: S) -> impl Sink<SpecEvent>
where
  S: AsyncWrite,
{
  let writer = BufWriter::new(sink);
  let codec = JsonLineEncoder::new(b"\n");
  FramedWrite::new(writer, codec)
}

pub fn into_json_array_items<S>(sink: S) -> FramedWrite<BufWriter<S>, JsonLineEncoder>
where
  S: AsyncWrite,
{
  let writer = BufWriter::new(sink);
  let codec = JsonLineEncoder::new(b",\n");
  FramedWrite::new(writer, codec)
}

// TODO: return a proper error, so downstream can distinguish between IO, serde, etc
// TODO: make this work with impl Stream instead
pub async fn write_to_json_array<S>(
  sink: S,
  spec_events: impl IntoIterator<Item = &SpecEvent>,
) -> Result<(), &'static str>
where
  S: AsyncWrite,
  S: Unpin,
  // E: Stream<Item = SpecEvent>,
  // E: Unpin,
{
  let mut framed_write = into_json_array_items(sink);

  framed_write
    .get_mut()
    .write_u8(b'[')
    .await
    .map_err(|_| "could not write array start")?;

  for spec_event in spec_events {
    if let Err(_) = framed_write.send(spec_event).await {
      panic!("could not stream event result to stdout"); // TODO: Find way to actually write error info
    }
  }
  framed_write
    .get_mut()
    .write_u8(b']')
    .await
    .map_err(|_| "could not write array start to stdout")?;

  framed_write
    .get_mut()
    .flush()
    .await
    .map_err(|_| "could not flush stdout")?;

  Ok(())
}
