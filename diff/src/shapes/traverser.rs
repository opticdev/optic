use super::visitors::JsonBodyVisitors;
use serde_json::Value as JsonValue;

pub struct Traverser<'a> {
  shape_queries: &'a ShapeQueries<'a>,
}

impl<'a> Traverser<'a> {
  pub fn new(shape_queries: &'a ShapeQueries) -> Self {
    Traverser { shape_queries }
  }

  pub fn traverse<R>(&self, jsonBody: Option<JsonValue>, visitors: &mut impl JsonBodyVisitors<R>) {}
}

pub struct ShapeQueries<'a> {
  shape_projection: &'a ShapeProjection,
}

pub struct ShapeProjection {}

#[cfg(test)]
mod test {
  use super::*;

  #[test]
  fn traversing_with_no_paths() {}
}
