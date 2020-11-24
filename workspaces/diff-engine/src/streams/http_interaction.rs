use tokio::io::{AsyncBufReadExt, AsyncRead, BufReader, Lines};

pub fn json_lines<R>(source: R) -> Lines<BufReader<R>>
where
  R: AsyncRead,
{
  // 8mb of capacity
  let reader = BufReader::with_capacity(8 * 1024 * 1024, source);
  reader.lines()
}
