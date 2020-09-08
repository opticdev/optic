use crate::shapes::ShapeDiffResult;
use crate::state::endpoint::{PathComponentId, RequestId, ResponseId};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub enum InteractionDiffResult {
  UnmatchedRequestUrl(UnmatchedRequestUrl),
  UnmatchedRequestBodyContentType(UnmatchedRequestBodyContentType),
  UnmatchedRequestBodyShape(UnmatchedRequestBodyShape),
  UnmatchedResponseBodyContentType(UnmatchedResponseBodyContentType),
  UnmatchedResponseBodyShape(UnmatchedResponseBodyShape),
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
#[serde(rename_all = "camelCase")]
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
#[serde(rename_all = "camelCase")]
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UnmatchedRequestBodyShape {
  pub interaction_trail: InteractionTrail,
  pub requests_trail: RequestSpecTrail,
  pub shape_diff_result: ShapeDiffResult,
}

impl UnmatchedRequestBodyShape {
  pub fn new(
    interaction_trail: InteractionTrail,
    requests_trail: RequestSpecTrail,
    shape_diff_result: ShapeDiffResult,
  ) -> Self {
    return UnmatchedRequestBodyShape {
      interaction_trail,
      requests_trail,
      shape_diff_result,
    };
  }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UnmatchedResponseBodyShape {
  pub interaction_trail: InteractionTrail,
  pub requests_trail: RequestSpecTrail,
  pub shape_diff_result: ShapeDiffResult,
}

impl UnmatchedResponseBodyShape {
  pub fn new(
    interaction_trail: InteractionTrail,
    requests_trail: RequestSpecTrail,
    shape_diff_result: ShapeDiffResult,
  ) -> Self {
    return UnmatchedResponseBodyShape {
      interaction_trail,
      requests_trail,
      shape_diff_result,
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
  Url {},
  Method {
    method: String,
  },
  #[serde(rename_all = "camelCase")]
  RequestBody {
    content_type: String,
  },
  #[serde(rename_all = "camelCase")]
  ResponseStatusCode {
    status_code: u16,
  },
  #[serde(rename_all = "camelCase")]
  ResponseBody {
    content_type: String,
    status_code: u16,
  },
}
