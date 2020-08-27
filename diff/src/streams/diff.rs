use super::JsonLineEncoder;
use futures::sink::Sink;
use serde::Serialize;
use tokio::io::{AsyncWrite, BufWriter};
use tokio_util::codec::FramedWrite;

use crate::interactions::InteractionDiffResult;

pub fn into_json_lines<S>(sink: S) -> impl Sink<InteractionDiffResult>
where
  S: AsyncWrite,
{
  let writer = BufWriter::new(sink);
  let codec = JsonLineEncoder::new();
  FramedWrite::new(writer, codec)
}
