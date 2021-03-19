use crate::learn_shape::TrailValues;
use crate::shapes::{JsonTrail, ShapeDiffResult};
use crate::state::endpoint::{PathComponentId, RequestId, ResponseId, ShapeId};
use serde::Serialize;
use std::collections::hash_map::{DefaultHasher, HashMap};
use std::hash::{Hash, Hasher};

#[derive(Debug, Serialize, Hash)]
pub enum InteractionDiffResult {
  UnmatchedRequestUrl(UnmatchedRequestUrl),
  UnmatchedRequestBodyContentType(UnmatchedRequestBodyContentType),
  UnmatchedRequestBodyShape(UnmatchedRequestBodyShape),
  UnmatchedResponseBodyContentType(UnmatchedResponseBodyContentType),
  UnmatchedResponseBodyShape(UnmatchedResponseBodyShape),
  //
  // Matches
  // -------
  #[serde(skip)]
  MatchedRequestBodyContentType(MatchedRequestBodyContentType),
  #[serde(skip)]
  MatchedResponseBodyContentType(MatchedResponseBodyContentType),
}

impl InteractionDiffResult {
  pub fn fingerprint(&self) -> String {
    let mut hash_state = DefaultHasher::new();
    Hash::hash(self, &mut hash_state);
    format!("{:x}", hash_state.finish())
  }
}

////////////////////////////////////////////////////////////////////////////////
#[derive(Debug, Serialize, Hash)]
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

#[derive(Debug, Serialize, Hash)]
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
#[derive(Clone, Debug, Serialize, Hash)]
pub struct MatchedRequestBodyContentType {
  pub interaction_trail: InteractionTrail,
  pub requests_trail: RequestSpecTrail,
  pub root_shape_id: ShapeId,
}

impl MatchedRequestBodyContentType {
  pub fn new(
    interaction_trail: InteractionTrail,
    requests_trail: RequestSpecTrail,
    root_shape_id: ShapeId,
  ) -> Self {
    return MatchedRequestBodyContentType {
      interaction_trail,
      requests_trail,
      root_shape_id,
    };
  }

  pub fn into_shape_diff(self, shape_diff_result: ShapeDiffResult) -> UnmatchedRequestBodyShape {
    UnmatchedRequestBodyShape::new(
      self.interaction_trail,
      self.requests_trail,
      shape_diff_result,
    )
  }
}

#[derive(Debug, Serialize, Hash)]
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

#[derive(Debug, Serialize, Clone, Hash)]
pub struct MatchedResponseBodyContentType {
  pub interaction_trail: InteractionTrail,
  pub requests_trail: RequestSpecTrail,
  pub root_shape_id: ShapeId,
}

impl MatchedResponseBodyContentType {
  pub fn new(
    interaction_trail: InteractionTrail,
    requests_trail: RequestSpecTrail,
    root_shape_id: ShapeId,
  ) -> Self {
    return MatchedResponseBodyContentType {
      interaction_trail,
      requests_trail,
      root_shape_id,
    };
  }
  pub fn into_shape_diff(self, shape_diff_result: ShapeDiffResult) -> UnmatchedResponseBodyShape {
    UnmatchedResponseBodyShape::new(
      self.interaction_trail,
      self.requests_trail,
      shape_diff_result,
    )
  }
}
#[derive(Debug, Serialize, Hash)]
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

#[derive(Debug, Serialize, Hash)]
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
pub struct BodyAnalysisResult {
  pub interaction_trail: InteractionTrail,
  pub trail_values: HashMap<JsonTrail, TrailValues>,
}

////////////////////////////////////////////////////////////////////////////////
#[derive(Clone, Debug, Serialize, Hash)]
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

  pub fn with_url(&mut self, url: String) {
    self
      .path
      .push(InteractionTrailPathComponent::Url { path: url })
  }

  pub fn with_method(&mut self, method: String) {
    self
      .path
      .push(InteractionTrailPathComponent::Method { method })
  }

  pub fn with_request_body(&mut self, content_type: String) {
    self
      .path
      .push(InteractionTrailPathComponent::RequestBody { content_type })
  }

  pub fn with_response_body(&mut self, content_type: String, status_code: u16) {
    self.path.push(InteractionTrailPathComponent::ResponseBody {
      content_type,
      status_code,
    })
  }
}
////////////////////////////////////////////////////////////////////////////////
#[derive(Clone, Debug, Serialize, Hash)]
pub enum RequestSpecTrail {
  SpecRoot(SpecRoot),
  SpecPath(SpecPath),
  SpecRequestRoot(SpecRequestRoot),
  SpecRequestBody(SpecRequestBody),
  SpecResponseRoot(SpecResponseRoot),
  SpecResponseBody(SpecResponseBody),
}

#[derive(Clone, Debug, Serialize, Hash)]
pub struct SpecRoot {}

#[derive(Clone, Debug, Serialize, Hash)]
#[serde(rename_all = "camelCase")]
pub struct SpecPath {
  pub path_id: PathComponentId,
}

#[derive(Clone, Debug, Serialize, Hash)]
#[serde(rename_all = "camelCase")]
pub struct SpecRequestRoot {
  pub request_id: RequestId,
}

#[derive(Clone, Debug, Serialize, Hash)]
#[serde(rename_all = "camelCase")]
pub struct SpecRequestBody {
  pub request_id: RequestId,
}

#[derive(Clone, Debug, Serialize, Hash)]
#[serde(rename_all = "camelCase")]
pub struct SpecResponseRoot {
  pub response_id: ResponseId,
}

#[derive(Clone, Debug, Serialize, Hash)]
#[serde(rename_all = "camelCase")]
pub struct SpecResponseBody {
  pub response_id: ResponseId,
}
//@GOTCHA make sure these serialize matching the existing scala code
#[derive(Clone, Debug, Serialize, Hash)]
pub enum InteractionTrailPathComponent {
  Url {
    path: String,
  },
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
