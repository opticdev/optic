use crate::state::endpoint::{PathComponentId, RequestId, ResponseId};

#[derive(Debug)]
pub enum InteractionDiffResult {
  UnmatchedRequestUrl(UnmatchedRequestUrl),
}

#[derive(Debug)]
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

#[derive(Debug)]
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

#[derive(Debug)]
pub enum RequestSpecTrail {
  SpecRoot,
  SpecPath(SpecPath),
  SpecRequestRoot(SpecRequestRoot),
  SpecRequestBody(SpecRequestBody),
  SpecResponseRoot(SpecResponseRoot),
  SpecResponseBody(SpecResponseBody),
}
#[derive(Debug)]
pub struct SpecPath {
  path_id: PathComponentId,
}

#[derive(Debug)]
pub struct SpecRequestRoot {
  request_id: RequestId,
}

#[derive(Debug)]
pub struct SpecRequestBody {
  request_id: RequestId,
}

#[derive(Debug)]
pub struct SpecResponseRoot {
  response_id: ResponseId,
}

#[derive(Debug)]
pub struct SpecResponseBody {
  response_id: ResponseId,
}

#[derive(Debug)]
pub enum InteractionTrailPathComponent {
  Method(String),
}
