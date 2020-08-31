use crate::state::endpoint::{PathComponentId, RequestId, ResponseId};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub enum InteractionDiffResult {
  UnmatchedRequestUrl(UnmatchedRequestUrl),
  UnmatchedRequestBodyContentType(UnmatchedRequestBodyContentType),
  UnmatchedResponseBodyContentType(UnmatchedResponseBodyContentType),
}
////////////////////////////////////////////////////////////////////////////////
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UnmatchedRequestUrl {
  pub interaction_trail: InteractionTrail,
  pub requests_trail: RequestSpecTrail,
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
pub struct UnmatchedRequestBodyContentType {
  pub interaction_trail: InteractionTrail,
  pub requests_trail: RequestSpecTrail,
}

impl UnmatchedRequestBodyContentType {
  pub fn new(interaction_trail: InteractionTrail, requests_trail: RequestSpecTrail) -> Self {
    return UnmatchedRequestBodyContentType {
      interaction_trail,
      requests_trail,
    };
  }
}

#[derive(Debug, Serialize)]
pub struct UnmatchedResponseBodyContentType {
  pub interaction_trail: InteractionTrail,
  pub requests_trail: RequestSpecTrail,
}

impl UnmatchedResponseBodyContentType {
  pub fn new(interaction_trail: InteractionTrail, requests_trail: RequestSpecTrail) -> Self {
    return UnmatchedResponseBodyContentType {
      interaction_trail,
      requests_trail,
    };
  }
}



////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////
#[derive(Debug, Serialize)]
pub enum RequestSpecTrail {
  SpecRoot(SpecRoot),
  SpecPath(SpecPath),
  SpecRequestRoot(SpecRequestRoot),
  SpecRequestBody(SpecRequestBody),
  SpecResponseRoot(SpecResponseRoot),
  SpecResponseBody(SpecResponseBody),
}

#[derive(Debug, Serialize)]
pub struct SpecRoot {}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecPath {
  pub path_id: PathComponentId,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecRequestRoot {
  pub request_id: RequestId,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecRequestBody {
  pub request_id: RequestId,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecResponseRoot {
  pub response_id: ResponseId,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SpecResponseBody {
  pub response_id: ResponseId,
}
//@GOTCHA make sure these serialize matching the existing scala code
#[derive(Debug, Serialize)]
pub enum InteractionTrailPathComponent {
  Url(),
  Method(String),
  RequestBody(String),
  ResponseStatusCode(u16),
  ResponseBody(String, u16),
}
