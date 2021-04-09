use super::JsonLineEncoder;
use futures::{sink::Sink, Stream, StreamExt};
use serde::Serialize;
use serde_json;
use std::path::Path;
use tokio::fs;
use tokio::io::{AsyncWrite, BufWriter};
use tokio_util::codec::FramedWrite;

use crate::interactions::InteractionDiffResult;

pub async fn from_json_line_file(
  path: impl AsRef<Path>,
) -> Result<Vec<InteractionDiffResult>, std::io::Error> {
  // TODO: return a Stream instead of a Vec, so consumer can decide on allocation
  let file = fs::File::open(path).await?;

  let json_lines = super::from_json_lines(file).map(|interaction_json_result| {
    let interaction_json = interaction_json_result?;
    let interaction: InteractionDiffResult = serde_json::from_str(&interaction_json)?;

    Ok(interaction)
  });

  Ok(vec![])
}

pub fn into_json_lines<S, T>(sink: S) -> impl Sink<T>
where
  S: AsyncWrite,
  T: Serialize,
{
  super::into_json_lines::<S, T>(sink)
}
