use futures::Stream;
use tokio::io::{AsyncBufReadExt, AsyncRead, BufReader, Lines};
use tokio_stream::wrappers::LinesStream;

pub fn json_lines<R>(source: R) -> impl Stream<Item = Result<String, std::io::Error>>
where
  R: AsyncRead,
{
  // 10 megabytes of capacity, to deal with unbound nature of request and response bodies
  super::json_lines(source, 10 * 1024 * 1024)
}
