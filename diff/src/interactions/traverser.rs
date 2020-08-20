use super::visitors::{InteractionVisitors, PathVisitor, PathVisitorContext};
use crate::interactions::HttpInteraction;
use crate::queries::endpoint::EndpointQueries;
use crate::state::endpoint::PathComponentId;

pub struct Traverser<'a> {
  endpoint_queries: &'a EndpointQueries<'a>,
}

impl<'a> Traverser<'a> {
  pub fn new(endpoint_queries: &'a EndpointQueries) -> Self {
    Traverser { endpoint_queries }
  }

  pub fn traverse<R>(
    &self,
    interaction: HttpInteraction,
    visitors: &mut impl InteractionVisitors<R>,
  ) {
    let root_id = String::from("root");
    let path_visitor = visitors.path();
    let resolved_path = self
      .endpoint_queries
      .resolve_path(&interaction.request.path, &root_id);
    path_visitor.visit(
      &interaction,
      PathVisitorContext {
        path: resolved_path,
      },
    );
  }
}

#[cfg(test)]
mod test {
  use super::*;

  #[test]
  fn traversing_with_no_paths() {}
}
