use bytes::{BufMut, Bytes, BytesMut};
use serde::Serialize;
use serde_json;
use std::io;
use tokio_util::codec::Encoder;

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
