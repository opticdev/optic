use super::{spec_events, JsonLineEncoder, JsonLineEncoderError};
use crate::events::{EventLoadingError, SpecChunkEvent};
use crate::{SpecAssemblerProjection, SpecEvent};
use fs::{read_dir, read_to_string};
use futures::{sink::Sink, SinkExt};
use serde_json;
use std::path::Path;
use std::{convert::TryFrom, ffi::OsString, path::PathBuf};
use tokio::io::AsyncWriteExt;
use tokio::{fs, io};
use tokio_stream::wrappers::ReadDirStream;
use tokio_stream::{StreamExt, StreamMap};
use tokio_util::codec::FramedWrite;

// TODO: return a stream instead of a Vec
pub async fn from_api_dir(
  path: impl AsRef<Path>,
) -> Result<Vec<SpecChunkEvent>, SpecChunkLoaderError> {
  let read_dir = fs::read_dir(path).await?;
  let mut dir_entries = ReadDirStream::new(read_dir);

  let mut chunks = Vec::<SpecChunkEvent>::new();
  while let Some(dir_entry_result) = dir_entries.next().await {
    let dir_entry = dir_entry_result?;

    let metadata = dir_entry.metadata().await?;

    if metadata.is_file() {
      let file_name = dir_entry.file_name();
      let file_path = dir_entry.path();

      let spec_events_result = spec_events::from_file(&file_path).await;
      if spec_events_result.is_err() {
        // TODO: consider logging this better
        eprintln!(
          "skipping file: not valid spec events path={:?}: {:?}",
          &file_path,
          spec_events_result.unwrap_err()
        );
        continue;
      }
      let spec_events = spec_events_result.unwrap();
      let name = file_name.into_string().map_err(|_| {
        SpecChunkLoaderError::Other("Filename could not be converted to valid UTF-8")
      })?;
      let is_root = name == "specification.json";

      chunks.push(SpecChunkEvent::from((name, is_root, spec_events)));
    }
  }

  Ok(chunks)
}

pub async fn from_root_api_file(
  path: impl AsRef<Path>,
) -> Result<Vec<SpecChunkEvent>, SpecChunkLoaderError> {
  let spec_events = spec_events::from_file(path).await?;

  Ok(vec![SpecChunkEvent::root_from_events(spec_events)])
}

pub async fn to_api_dir(
  chunk_events: impl Iterator<Item = &SpecChunkEvent>,
  path: impl AsRef<Path>,
) -> Result<usize, SpecChunkWriterError> {
  let mut count = 0;
  for chunk_event in chunk_events {
    let name = match chunk_event {
      SpecChunkEvent::Batch(batch_chunk) => batch_chunk.name.clone(),
      SpecChunkEvent::Root(_) => String::from("specification"),
      SpecChunkEvent::Unknown(_) => Err(SpecChunkWriterError::UnsupportedKind(
        "writing of unknown chunk events not supported",
      ))?,
    };

    let events = chunk_event.events();

    let file_path = path.as_ref().join(format!("{}.json", name));
    let file = fs::File::create(file_path).await?;

    // TODO: use spec_events::write_to_json_array instead of doing this manually
    super::write_to_json_array(file, events)
      .await
      .expect("could not write events to file");

    count += 1;
  }

  Ok(count)
}

#[derive(Debug)]
pub enum SpecChunkLoaderError {
  Io(io::Error),
  Json(serde_json::Error),
  Other(&'static str),
}

impl From<io::Error> for SpecChunkLoaderError {
  fn from(err: io::Error) -> SpecChunkLoaderError {
    SpecChunkLoaderError::Io(err)
  }
}

impl From<EventLoadingError> for SpecChunkLoaderError {
  fn from(err: EventLoadingError) -> Self {
    match err {
      EventLoadingError::Io(err) => SpecChunkLoaderError::Io(err),
      EventLoadingError::Json(err) => SpecChunkLoaderError::Json(err),
      EventLoadingError::Avro(err) => SpecChunkLoaderError::Other("unsupported encoding used"),
    }
  }
}

#[derive(Debug)]
pub enum SpecChunkWriterError {
  Io(std::io::Error),
  JsonEncoding(serde_json::Error),
  UnsupportedKind(&'static str),
  Other(&'static str),
}

impl From<io::Error> for SpecChunkWriterError {
  fn from(err: io::Error) -> SpecChunkWriterError {
    SpecChunkWriterError::Io(err)
  }
}

impl From<JsonLineEncoderError> for SpecChunkWriterError {
  fn from(err: JsonLineEncoderError) -> SpecChunkWriterError {
    match err {
      JsonLineEncoderError::Io(io_err) => SpecChunkWriterError::Io(io_err),
      JsonLineEncoderError::Json(json_err) => SpecChunkWriterError::JsonEncoding(json_err),
    }
  }
}

#[cfg(test)]
mod test {
  use cqrs_core::Event;

  use super::*;

  #[tokio::main]
  #[test]
  pub async fn can_read_spec_chunks_from_api_dir() {
    let api_dir_path = std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/split-spec-changes/");
    dbg!(&api_dir_path);

    let chunks = from_api_dir(String::from(api_dir_path.to_str().unwrap()))
      .await
      .unwrap();

    assert_eq!(chunks.len(), 3);
    dbg!(chunks
      .iter()
      .map(|chunk| (chunk.event_type(), chunk.name(), chunk.len()))
      .collect::<Vec<_>>());
  }
}
