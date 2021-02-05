use super::spec_events;
use crate::{
  events::{spec_chunk, SpecChunkEvent},
  SpecAssemblerProjection, SpecEvent,
};
use fs::{read_dir, read_to_string};
use std::ffi::OsString;
use std::path::Path;
use tokio::{fs, io};
use tokio_stream::wrappers::ReadDirStream;
use tokio_stream::{StreamExt, StreamMap};

// TODO: return a stream instead of a Vec
pub async fn from_api_dir(path_str: String) -> Result<Vec<SpecChunkEvent>, SpecChunkLoaderError> {
  let path = Path::new(&path_str);

  let read_dir = fs::read_dir(&path).await?;
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

#[derive(Debug)]
pub enum SpecChunkLoaderError {
  Io(io::Error),
  Other(&'static str),
}

impl From<io::Error> for SpecChunkLoaderError {
  fn from(err: io::Error) -> SpecChunkLoaderError {
    SpecChunkLoaderError::Io(err)
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
