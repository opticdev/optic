use super::{JsonLineEncoder, JsonLineReaderError};
use futures::{sink::Sink, Stream, StreamExt, TryStreamExt};
use serde::Serialize;
use serde_json;
use std::path::Path;
use tokio::fs;
use tokio::io::{AsyncWrite, BufWriter};
use tokio_util::codec::FramedWrite;

use crate::interactions::InteractionDiffResult;
use crate::state::TaggedInput;

// TODO: return a Stream instead of a Vec, so consumer can decide on allocation
pub async fn tagged_from_json_line_file(
  path: impl AsRef<Path>,
) -> Result<Vec<TaggedInput<InteractionDiffResult>>, JsonLineReaderError> {
  let file = fs::File::open(path).await?;

  let parsing_diff_result = super::from_json_lines(file)
    .map(
      |diff_result_json_result| -> Result<TaggedInput<InteractionDiffResult>, JsonLineReaderError> {
        let diff_result_json = diff_result_json_result?;
        let diff_result = serde_json::from_str(&diff_result_json)?;

        Ok(diff_result)
      },
    )
    .try_collect::<Vec<_>>()
    .await;

  parsing_diff_result
}

pub fn into_json_lines<S, T>(sink: S) -> impl Sink<T>
where
  S: AsyncWrite,
  T: Serialize,
{
  super::into_json_lines::<S, T>(sink)
}
