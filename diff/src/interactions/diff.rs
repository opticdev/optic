use crate::state::endpoint::{PathComponentId, RequestId, ResponseId};

pub enum InteractionDiffResult {
  UnmatchedRequestUrl(UnmatchedRequestUrl),
}

pub struct UnmatchedRequestUrl {
  interaction_trail: InteractionTrail,
  requests_trail: RequestSpecTrail,
}

impl UnmatchedRequestUrl {
  pub fn new(interaction_trail: InteractionTrail, requests_trail: RequestSpecTrail) -> Self {
    return UnmatchedRequestUrl {
      interaction_trail,
      requests_trail,
    };
  }
}

pub struct InteractionTrail {
  pub path: Vec<InteractionTrailPathComponent>,
}

impl InteractionTrail {
  pub fn new(path: Vec<InteractionTrailPathComponent>) -> Self {
    InteractionTrail { path }
  }

  pub fn empty() -> Self {
    InteractionTrail { path: vec![] }
  }
}

pub enum RequestSpecTrail {
  SpecRoot,
  SpecPath(SpecPath),
  SpecRequestRoot(SpecRequestRoot),
  SpecRequestBody(SpecRequestBody),
  SpecResponseRoot(SpecResponseRoot),
  SpecResponseBody(SpecResponseBody),
}

pub struct SpecPath {
  path_id: PathComponentId,
}
pub struct SpecRequestRoot {
  request_id: RequestId,
}
pub struct SpecRequestBody {
  request_id: RequestId,
}
pub struct SpecResponseRoot {
  response_id: ResponseId,
}
pub struct SpecResponseBody {
  response_id: ResponseId,
}

pub enum InteractionTrailPathComponent {
  Method(String),
}
