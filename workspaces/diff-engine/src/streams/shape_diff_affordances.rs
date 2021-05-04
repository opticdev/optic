use super::JsonLineEncoderError;
use crate::projections::learners::shape_diff_affordances::ShapeDiffAffordances;
use futures::Sink;
use tokio::io::AsyncWrite;

pub fn into_json_lines<S>(
  sink: S,
) -> impl Sink<(ShapeDiffAffordances, String), Error = JsonLineEncoderError>
where
  S: AsyncWrite,
{
  super::into_json_lines::<S, (ShapeDiffAffordances, String)>(sink)
}
