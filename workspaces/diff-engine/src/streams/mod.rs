use bytes::{BufMut, Bytes, BytesMut};
use futures::{sink::Sink, SinkExt};
use serde::Serialize;
use serde_json;
use std::io;
use tokio::io::{
  AsyncBufReadExt, AsyncRead, AsyncWrite, AsyncWriteExt, BufReader, BufWriter, Lines,
};
use tokio_util::codec::{Encoder, FramedWrite};

pub mod diff;
pub mod http_interaction;
pub mod spec_chunks;
pub mod spec_events;

pub struct JsonLineEncoder {
  delimeter: Bytes,
  first: bool,
}

impl Default for JsonLineEncoder {
  fn default() -> Self {
    Self {
      delimeter: Bytes::from_static(b"\n"),
      first: true,
    }
  }
}

impl JsonLineEncoder {
  fn new(delimeter: &[u8]) -> Self {
    Self {
      delimeter: Bytes::copy_from_slice(delimeter),
      first: true,
    }
  }
}

impl<T> Encoder<T> for JsonLineEncoder
where
  T: Serialize,
{
  type Error = JsonLineEncoderError;

  fn encode(&mut self, item: T, buf: &mut BytesMut) -> Result<(), Self::Error> {
    let json = serde_json::to_string(&item)?;
    buf.reserve(json.len() + self.delimeter.len());
    if self.first {
      self.first = false;
    } else {
      buf.put(&self.delimeter[..]);
    }
    buf.put(json.as_bytes());
    Ok(())
  }
}

pub enum JsonLineEncoderError {
  Json(serde_json::Error),
  Io(io::Error),
}

impl From<io::Error> for JsonLineEncoderError {
  fn from(err: io::Error) -> JsonLineEncoderError {
    JsonLineEncoderError::Io(err)
  }
}

impl From<serde_json::Error> for JsonLineEncoderError {
  fn from(err: serde_json::Error) -> JsonLineEncoderError {
    JsonLineEncoderError::Json(err)
  }
}

// TODO: return a proper error, so downstream can distinguish between IO, serde, etc
// TODO: make this work with impl Stream instead
pub async fn write_to_json_array<'a, S, I>(
  sink: S,
  items: impl IntoIterator<Item = &'a I>,
) -> Result<(), &'static str>
where
  S: AsyncWrite,
  S: Unpin,
  I: Serialize,
  I: 'a,
  // E: Unpin
{
  let mut framed_write = into_json_array_items(sink);

  framed_write
    .get_mut()
    .write_u8(b'[')
    .await
    .map_err(|_| "could not write array start")?;

  for item in items {
    if let Err(_) = framed_write.send(item).await {
      panic!("could not item to sink"); // TODO: Find way to actually write error info
    }
  }
  framed_write
    .get_mut()
    .write_u8(b']')
    .await
    .map_err(|_| "could not write array start to sink")?;

  framed_write
    .get_mut()
    .flush()
    .await
    .map_err(|_| "could not flush sink")?;

  Ok(())
}

pub fn into_json_array_items<S>(sink: S) -> FramedWrite<BufWriter<S>, JsonLineEncoder>
where
  S: AsyncWrite,
{
  let writer = BufWriter::new(sink);
  let codec = JsonLineEncoder::new(b"\n,");
  FramedWrite::new(writer, codec)
}
