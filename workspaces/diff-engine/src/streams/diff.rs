use super::JsonLineEncoder;
use futures::sink::Sink;
use serde::Serialize;
use tokio::io::{AsyncWrite, BufWriter};
use tokio_util::codec::FramedWrite;

use crate::interactions::InteractionDiffResult;

pub fn into_json_lines<S, T>(sink: S) -> impl Sink<T>
where
  S: AsyncWrite,
  T: Serialize,
{
  super::into_json_lines::<S, T>(sink)
}
