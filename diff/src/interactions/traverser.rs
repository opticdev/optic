use super::visitors::InteractionVisitors;
use crate::interactions::http_interaction::HttpInteraction;
use crate::state::endpoint::PathComponentId;

pub struct RequestsQueries {}

impl RequestsQueries {
  pub fn resolve_path(&self, path: String) -> Option<PathComponentId> {
    None
  }
}

pub struct Traverser<'a> {
  requests_queries: &'a RequestsQueries,
}

impl<'a> Traverser<'a> {
  pub fn new(requests_queries: &'a RequestsQueries) -> Self {
    Traverser { requests_queries }
  }

  pub fn traverse(&self, interaction: HttpInteraction, visitors: &mut impl InteractionVisitors) {
    let path_visitor = visitors.path();
    let resolved_path = self.requests_queries.resolve_path(interaction.request.path);
  }
}

#[cfg(test)]
mod test {
  use super::*;

  #[test]
  fn traversing_with_no_paths() {
    let q = RequestsQueries {};
    let traverser = Traverser::new(&q);
  }
}
