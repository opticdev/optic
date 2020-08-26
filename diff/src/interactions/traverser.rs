use super::visitors::{InteractionVisitors, PathVisitor, RequestBodyVisitor, PathVisitorContext};
use crate::interactions::HttpInteraction;
use crate::queries::endpoint::EndpointQueries;
use crate::state::endpoint::PathComponentId;
use crate::projections::endpoint::ROOT_PATH_ID;

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
    let path_visitor = visitors.path();
    let resolved_path = self
      .endpoint_queries
      .resolve_path(&interaction);
    path_visitor.visit(
      &interaction,
      PathVisitorContext {
        path: resolved_path,
      },
    );

    let request_body_visitor = visitors.request_body();
    request_body_visitor.begin();
    match resolved_path {
      Some(path_id) => {
        let operations = self.endpoint_queries.resolve_operations(&interaction, String::from(path_id));
        //println!("{:?}", operations);
      },
      None => {}
    };
    request_body_visitor.end();
  }
}

#[cfg(test)]
mod test {
  use super::*;

  #[test]
  fn traversing_with_no_paths() {}
}
