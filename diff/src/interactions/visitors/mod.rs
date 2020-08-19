pub mod diff;

use super::http_interaction::HttpInteraction;
use crate::state::endpoint::PathComponentId;

pub trait InteractionVisitors {
  type Path: PathVisitor;

  fn path(&mut self) -> &mut Self::Path;
}

pub trait PathVisitor {
  fn visit(&mut self, interaction: HttpInteraction, context: PathVisitorContext);
}

pub struct PathVisitorContext {
  path: Option<PathComponentId>,
}
