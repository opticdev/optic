use bytes::{BufMut, Bytes, BytesMut};
use futures::{sink::Sink, SinkExt, Stream};
use serde::de::{self, Deserializer, IgnoredAny, SeqAccess, Visitor};
use serde::{Deserialize, Serialize};
use serde_json;
use std::{collections::HashSet, io};
use thiserror::Error;
use tokio::io::{
  AsyncBufReadExt, AsyncRead, AsyncWrite, AsyncWriteExt, BufReader, BufWriter, Lines,
};
use tokio_stream::wrappers::LinesStream;
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

#[derive(Debug, Error)]
pub enum JsonLineEncoderError {
  #[error("json serialisation error: {}", .0)]
  Json(serde_json::Error),
  #[error("io error: {}", .0)]
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

#[derive(Debug, Error)]
pub enum JsonLineReaderError {
  #[error("json deserialisation error: {}", .source)]
  Json {
    #[from]
    source: serde_json::Error,
  },

  #[error("io error: {}", .source)]
  Io {
    #[from]
    source: io::Error,
  },
}

#[derive(Debug, Serialize)]
pub struct TaggedInput<T>(pub T, pub Tags);
pub type Tags = HashSet<String>;

impl<T> TaggedInput<T> {
  pub fn into_parts(self) -> (T, Tags) {
    (self.0, self.1)
  }

  pub fn parts(&self) -> (&T, &Tags) {
    (&self.0, &self.1)
  }
}

// Custom implementation of Deserialize, to allow ignoring additional items in the tuple,
// making it significantly easier to pipe results back in as inputs.
impl<'de, T> Deserialize<'de> for TaggedInput<T>
where
  T: Deserialize<'de>,
{
  fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
  where
    D: Deserializer<'de>,
  {
    struct TaggedInputVisitor<T> {
      marker: std::marker::PhantomData<T>,
    }

    impl<'de, T> Visitor<'de> for TaggedInputVisitor<T>
    where
      T: Deserialize<'de>,
    {
      type Value = TaggedInput<T>;

      fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
        formatter.write_str("struct TaggedInput")
      }

      fn visit_seq<V>(self, mut seq: V) -> Result<Self::Value, V::Error>
      where
        V: SeqAccess<'de>,
      {
        let s = seq
          .next_element()?
          .ok_or_else(|| de::Error::invalid_length(0, &self))?;
        let n = seq
          .next_element()?
          .ok_or_else(|| de::Error::invalid_length(1, &self))?;

        // we must visit the rest of the elements in the sequence to prevent panics
        while let Some(IgnoredAny) = seq.next_element()? {
          // but we can just ignore them
        }

        Ok(TaggedInput(s, n))
      }
    }

    deserializer.deserialize_seq(TaggedInputVisitor {
      marker: std::marker::PhantomData,
    })
  }
}

// pub struct TaggedInputIterator<T> {
//   inner: Option<TaggedInput<T>>,
// }

// impl<T> Iterator for TaggedInputIterator<T> {
//   type Item = (Tags, T);

//   #[inline]
//   fn next(&mut self) -> Option<Self::Item> {
//     self.inner.take();

//     tagged_input.map(|tagged_input| {
//       let TaggedInput(input, tags) = tagged_input;
//       (tags, input)
//     })
//   }
// }

// impl<T> IntoIterator for TaggedInput<T> {
//   type Item = (Tags, T);
//   type IntoIter = TaggedInputIterator<T>;

//   fn into_iter(self) -> Self::IntoIter {
//     TaggedInputIterator { inner: Some(self) }
//   }
// }

pub fn json_lines<R>(
  source: R,
  buffer_capacity: usize,
) -> impl Stream<Item = Result<String, std::io::Error>>
where
  R: AsyncRead,
{
  let reader = BufReader::with_capacity(buffer_capacity, source);
  LinesStream::new(reader.lines())
}

pub async fn write_to_json_lines<'a, S, I>(
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
  let mut framed_write = into_json_lines::<S, I>(sink);

  for item in items {
    if let Err(_) = framed_write.send(item).await {
      panic!("could not send json line to sink"); // TODO: Find way to actually write error info
    }
  }

  Ok(())
}

// TODO: return a proper error, so downstream can distinguish between IO, serde, etc
// TODO: make this work with impl Stream instead
pub async fn write_to_json_array<'a, S, I>(
  sink: S,
  items: impl IntoIterator<Item = &'a I>,
) -> Result<(), JsonLineEncoderError>
where
  S: AsyncWrite,
  S: Unpin,
  I: Serialize,
  I: 'a,
  // E: Unpin
{
  let mut framed_write = into_json_array_items(sink);

  framed_write.get_mut().write_u8(b'[').await?;

  for item in items {
    if let Err(_) = framed_write.send(item).await {
      panic!("could not send json array item to sink"); // TODO: Find way to actually write error info
    }
  }
  framed_write.get_mut().write_u8(b']').await?;

  framed_write.get_mut().flush().await?;

  Ok(())
}

pub fn into_json_lines<S, I>(sink: S) -> FramedWrite<BufWriter<S>, JsonLineEncoder>
where
  S: AsyncWrite,
  I: Serialize,
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
  let codec = JsonLineEncoder::new(b"\n,");
  FramedWrite::new(writer, codec)
}

pub fn from_json_lines<R>(source: R) -> impl Stream<Item = Result<String, std::io::Error>>
where
  R: AsyncRead,
{
  // 10 megabytes of capacity, to deal with unbound nature of request and response bodies
  let reader = BufReader::with_capacity(10 * 1024 * 1024, source);
  LinesStream::new(reader.lines())
}
