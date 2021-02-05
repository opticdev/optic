use crate::events::{EventLoadingError, SpecEvent};
use std::path::Path;
use tokio::{fs::read_to_string, io::AsyncReadExt};

// TODO: return a stream instead of a Vec
pub async fn from_file(path: impl AsRef<Path>) -> Result<Vec<SpecEvent>, EventLoadingError> {
  let file_contents = read_to_string(path).await?;

  let events: Vec<SpecEvent> = serde_json::from_str(&file_contents)?;

  Ok(events)
}
