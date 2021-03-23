use crate::learn_shape::TrailObservationsResult;
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
#[derive(Clone, Debug)]
pub struct BodyAnalysisResult {
  pub body_location: BodyAnalysisLocation,
  pub trail_observations: TrailObservationsResult,
}

#[derive(Clone, Debug, Hash, PartialEq, Eq)]
pub enum BodyAnalysisLocation {
  Request {
    path_id: PathComponentId,
    method: String,
    content_type: String,
  },
  Response {
    path_id: PathComponentId,
    method: String,
    content_type: String,
    status_code: u16,
  },
}

impl From<UnmatchedRequestBodyContentType> for BodyAnalysisLocation {
  fn from(diff: UnmatchedRequestBodyContentType) -> Self {
    let interaction_trail = diff.interaction_trail;

    Self::Request {
      path_id: diff
        .requests_trail
        .get_path_id()
        .expect("UnmatchedRequestBodyContentType implies request to have a known path")
        .clone(),
      method: interaction_trail
        .get_method()
        .expect("UnmatchedRequestBodyContentType implies request to have a known method")
        .clone(),
      content_type: interaction_trail
        .get_request_content_type()
        .expect("UnmatchedRequestBodyContentType implies request to have a content type")
        .clone(),
    }
  }
}

impl From<UnmatchedResponseBodyContentType> for BodyAnalysisLocation {
  fn from(diff: UnmatchedResponseBodyContentType) -> Self {
    let interaction_trail = diff.interaction_trail;

    Self::Response {
      path_id: diff
        .requests_trail
        .get_path_id()
        .expect("UnmatchedResponseBodyContentType implies response to have a known path")
        .clone(),
      method: interaction_trail
        .get_method()
        .expect("UnmatchedResponseBodyContentType implies response to have a known method")
        .clone(),
      content_type: interaction_trail
        .get_response_content_type()
        .expect("UnmatchedResponseBodyContentType implies response to have a content type")
        .clone(),
      status_code: interaction_trail
        .get_response_status_code()
        .expect("UnmatchedResponseBodyContentType implies response to have a status code"),
    }
  }
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

  pub fn get_method(&self) -> Option<&String> {
    self.path.iter().find_map(|component| match component {
      InteractionTrailPathComponent::Method { method } => Some(method),
      _ => None,
    })
  }

  pub fn get_request_content_type(&self) -> Option<&String> {
    self.path.iter().find_map(|component| match component {
      InteractionTrailPathComponent::RequestBody { content_type } => Some(content_type),
      _ => None,
    })
  }

  pub fn get_response_content_type(&self) -> Option<&String> {
    self.path.iter().find_map(|component| match component {
      InteractionTrailPathComponent::ResponseBody { content_type, .. } => Some(content_type),
      _ => None,
    })
  }

  pub fn get_response_status_code(&self) -> Option<u16> {
    self.path.iter().find_map(|component| match component {
      InteractionTrailPathComponent::ResponseBody { status_code, .. } => Some(*status_code),
      _ => None,
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

impl RequestSpecTrail {
  pub fn get_path_id(&self) -> Option<&String> {
    match self {
      RequestSpecTrail::SpecPath(spec_path) => Some(&spec_path.path_id),
      _ => None,
    }
  }
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
