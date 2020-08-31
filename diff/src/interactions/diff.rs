use crate::state::endpoint::{PathComponentId, RequestId, ResponseId};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub enum InteractionDiffResult {
  UnmatchedRequestUrl(UnmatchedRequestUrl),
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
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

#[derive(Debug, Serialize)]
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

#[derive(Debug, Serialize)]
pub enum RequestSpecTrail {
  SpecRoot,
  SpecPath(SpecPath),
  SpecRequestRoot(SpecRequestRoot),
  SpecRequestBody(SpecRequestBody),
  SpecResponseRoot(SpecResponseRoot),
  SpecResponseBody(SpecResponseBody),
}
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecPath {
  path_id: PathComponentId,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecRequestRoot {
  request_id: RequestId,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecRequestBody {
  request_id: RequestId,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecResponseRoot {
  response_id: ResponseId,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecResponseBody {
  response_id: ResponseId,
}

#[derive(Debug, Serialize)]
pub enum InteractionTrailPathComponent {
  Method(String),
}
