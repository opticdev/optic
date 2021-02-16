use tokio::io::{AsyncBufReadExt, AsyncRead, BufReader, Lines};
use tokio_stream::wrappers::LinesStream;

pub fn json_lines<R>(source: R) -> LinesStream<BufReader<R>>
where
  R: AsyncRead,
{
  // 10 megabytes of capacity, to deal with unbound nature of request and response bodies
  let reader = BufReader::with_capacity(10 * 1024 * 1024, source);
  LinesStream::new(reader.lines())
}
