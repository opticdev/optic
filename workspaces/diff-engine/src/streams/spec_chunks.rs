use crate::{events::SpecChunkEvent, SpecAssemblerProjection};
use fs::read_dir;
use std::path::Path;
use tokio::{fs, io};
use tokio_stream::wrappers::ReadDirStream;
use tokio_stream::StreamExt;

pub async fn from_api_dir(path_str: String) -> Result<(), SpecChunkLoaderError> {
  let path = Path::new(&path_str);

  let read_dir = fs::read_dir(&path).await?;
  let mut dir_entries = ReadDirStream::new(read_dir);

  while let Some(dir_entry_result) = dir_entries.next().await {
    let dir_entry = dir_entry_result?;
    dbg!(dir_entry);
  }

  Ok(())
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
  use super::*;

  #[tokio::main]
  #[test]
  pub async fn can_read_spec_chunks_from_api_dir() {
    let api_dir_path = std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/split-spec-changes/");
    dbg!(&api_dir_path);

    from_api_dir(String::from(api_dir_path.to_str().unwrap()))
      .await
      .unwrap();
  }
}
