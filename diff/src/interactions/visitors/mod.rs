mod diff;

use super::http_interaction::HttpInteraction;
use crate::state::endpoint::PathComponentId;

pub trait PathVisitor {
  fn visit(&mut self, interaction: HttpInteraction, context: PathVisitorContext);
}

pub struct PathVisitorContext {
  path: Option<PathComponentId>,
}
