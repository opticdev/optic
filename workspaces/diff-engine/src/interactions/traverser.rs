use super::visitors::{
  InteractionVisitors, PathVisitor, PathVisitorContext, RequestBodyVisitor,
  RequestBodyVisitorContext, ResponseBodyVisitor, ResponseBodyVisitorContext,
};
use crate::events::HttpInteraction;
use crate::projections::endpoint::ROOT_PATH_ID;
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
    interaction: &HttpInteraction,
    visitors: &mut impl InteractionVisitors<R>,
  ) {
    let path_visitor = visitors.path();
    let resolved_path = self.endpoint_queries.resolve_interaction_path(&interaction);
    let path_context = PathVisitorContext {
      path: resolved_path,
    };
    path_visitor.visit(interaction, &path_context);

    let request_body_visitor = visitors.request_body();
    request_body_visitor.begin();
    match resolved_path {
      Some(path_id) => {
        let operations = self
          .endpoint_queries
          .resolve_operations(interaction, path_id);
        for operation in operations {
          request_body_visitor.visit(
            interaction,
            &RequestBodyVisitorContext {
              path: path_id,
              operation: Some(operation),
            },
          );
        }
      }
      None => {}
    };
    request_body_visitor.end(interaction, &path_context);

    // eprintln!("starting response body visiting");
    let response_body_visitor = visitors.response_body();
    response_body_visitor.begin();
    match resolved_path {
      Some(path_id) => {
        let responses = self
          .endpoint_queries
          .resolve_responses(interaction, path_id);
        for response in responses {
          // eprintln!("visiting response body");
          response_body_visitor.visit(
            interaction,
            &ResponseBodyVisitorContext {
              path: path_id,
              response: Some(response),
            },
          );
        }
      }
      None => {}
    };
    response_body_visitor.end(interaction, &path_context);
    // eprintln!("ended response body visiting");
  }
}

#[cfg(test)]
mod test {
  use super::*;

  #[test]
  fn traversing_with_no_paths() {}
}
