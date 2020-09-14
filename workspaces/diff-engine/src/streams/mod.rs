use bytes::{BufMut, BytesMut};
use serde::Serialize;
use serde_json;
use std::io;
use tokio_util::codec::Encoder;

pub mod diff;
pub mod http_interaction;

pub struct JsonLineEncoder {}

impl JsonLineEncoder {
  fn new() -> Self {
    Self {}
  }
}

impl<T> Encoder<T> for JsonLineEncoder
where
  T: Serialize,
{
  type Error = JsonLineEncoderError;

  fn encode(&mut self, item: T, buf: &mut BytesMut) -> Result<(), Self::Error> {
    let json = serde_json::to_string(&item)?;
    buf.reserve(json.len() + 1);
    buf.put(json.as_bytes());
    buf.put_u8(b'\n');
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
