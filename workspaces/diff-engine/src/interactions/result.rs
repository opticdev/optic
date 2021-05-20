use crate::events::http_interaction::HttpInteraction;
use crate::learn_shape::TrailObservationsResult;
use crate::shapes::{JsonTrail, ShapeDiffResult};
use crate::state::endpoint::{PathComponentId, RequestId, ResponseId, ShapeId};
use serde::{Deserialize, Serialize};
use std::collections::hash_map::{DefaultHasher, HashMap};
use std::hash::{Hash, Hasher};

#[derive(Debug, Deserialize, Serialize, Hash)]
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

  pub fn interaction_trail(&self) -> &InteractionTrail {
    match self {
      InteractionDiffResult::UnmatchedRequestUrl(diff) => &diff.interaction_trail,
      InteractionDiffResult::UnmatchedRequestBodyContentType(diff) => &diff.interaction_trail,
      InteractionDiffResult::UnmatchedRequestBodyShape(diff) => &diff.interaction_trail,
      InteractionDiffResult::UnmatchedResponseBodyContentType(diff) => &diff.interaction_trail,
      InteractionDiffResult::UnmatchedResponseBodyShape(diff) => &diff.interaction_trail,
      InteractionDiffResult::MatchedRequestBodyContentType(diff) => &diff.interaction_trail,
      InteractionDiffResult::MatchedResponseBodyContentType(diff) => &diff.interaction_trail,
    }
  }

  pub fn requests_trail(&self) -> &RequestSpecTrail {
    match self {
      InteractionDiffResult::UnmatchedRequestUrl(diff) => &diff.requests_trail,
      InteractionDiffResult::UnmatchedRequestBodyContentType(diff) => &diff.requests_trail,
      InteractionDiffResult::UnmatchedRequestBodyShape(diff) => &diff.requests_trail,
      InteractionDiffResult::UnmatchedResponseBodyContentType(diff) => &diff.requests_trail,
      InteractionDiffResult::UnmatchedResponseBodyShape(diff) => &diff.requests_trail,
      InteractionDiffResult::MatchedRequestBodyContentType(diff) => &diff.requests_trail,
      InteractionDiffResult::MatchedResponseBodyContentType(diff) => &diff.requests_trail,
    }
  }

  pub fn json_trail(&self) -> Option<&JsonTrail> {
    let shape_diff_result = match self {
      InteractionDiffResult::UnmatchedRequestBodyShape(diff) => Some(&diff.shape_diff_result),
      InteractionDiffResult::UnmatchedResponseBodyShape(diff) => Some(&diff.shape_diff_result),
      _ => None,
    }?;

    match shape_diff_result {
      ShapeDiffResult::UnmatchedShape { json_trail, .. } => Some(json_trail),
      ShapeDiffResult::UnspecifiedShape { json_trail, .. } => Some(json_trail),
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
#[derive(Debug, Deserialize, Serialize, Hash)]
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

#[derive(Debug, Deserialize, Serialize, Hash)]
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

#[derive(Debug, Deserialize, Serialize, Hash)]
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
#[derive(Debug, Deserialize, Serialize, Hash)]
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

#[derive(Debug, Deserialize, Serialize, Hash)]
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
  UnmatchedRequest {
    path_id: PathComponentId,
    method: String,
    content_type: Option<String>,
  },
  UnmatchedResponse {
    path_id: PathComponentId,
    method: String,
    content_type: Option<String>,
    status_code: u16,
  },
  MatchedRequest {
    request_id: RequestId,
    content_type: Option<String>,
  },
  MatchedResponse {
    response_id: ResponseId,
    content_type: Option<String>,
    status_code: u16,
  },
}

impl BodyAnalysisLocation {
  pub fn content_type(&self) -> Option<&String> {
    match self {
      BodyAnalysisLocation::UnmatchedRequest { content_type, .. } => content_type.as_ref(),
      BodyAnalysisLocation::UnmatchedResponse { content_type, .. } => content_type.as_ref(),
      BodyAnalysisLocation::MatchedRequest { content_type, .. } => content_type.as_ref(),
      BodyAnalysisLocation::MatchedResponse { content_type, .. } => content_type.as_ref(),
    }
  }
}

impl From<UnmatchedRequestBodyContentType> for BodyAnalysisLocation {
  fn from(diff: UnmatchedRequestBodyContentType) -> Self {
    let interaction_trail = diff.interaction_trail;

    Self::UnmatchedRequest {
      path_id: diff
        .requests_trail
        .get_path_id()
        .expect("UnmatchedRequestBodyContentType implies request to have a known path")
        .clone(),
      method: interaction_trail
        .get_method()
        .expect("UnmatchedRequestBodyContentType implies request to have a known method")
        .clone(),
      content_type: interaction_trail.get_request_content_type().cloned(),
    }
  }
}

impl From<UnmatchedResponseBodyContentType> for BodyAnalysisLocation {
  fn from(diff: UnmatchedResponseBodyContentType) -> Self {
    let interaction_trail = diff.interaction_trail;

    Self::UnmatchedResponse {
      path_id: diff
        .requests_trail
        .get_path_id()
        .expect("UnmatchedResponseBodyContentType implies response to have a known path")
        .clone(),
      method: interaction_trail
        .get_method()
        .expect("UnmatchedResponseBodyContentType implies response to have a known method")
        .clone(),
      content_type: interaction_trail.get_response_content_type().cloned(),
      status_code: interaction_trail
        .get_response_status_code()
        .expect("UnmatchedResponseBodyContentType implies response to have a status code"),
    }
  }
}

impl From<MatchedRequestBodyContentType> for BodyAnalysisLocation {
  fn from(diff: MatchedRequestBodyContentType) -> Self {
    let interaction_trail = diff.interaction_trail;

    Self::MatchedRequest {
      request_id: diff
        .requests_trail
        .get_request_id()
        .expect("MatchedRequestBodyContentType implies request to have a known request id")
        .clone(),
      content_type: interaction_trail.get_request_content_type().cloned(),
    }
  }
}

impl From<MatchedResponseBodyContentType> for BodyAnalysisLocation {
  fn from(diff: MatchedResponseBodyContentType) -> Self {
    let interaction_trail = diff.interaction_trail;

    Self::MatchedResponse {
      response_id: diff
        .requests_trail
        .get_response_id()
        .expect("MatchedResponseBodyContentType implies response to have a known response id")
        .clone(),
      content_type: interaction_trail.get_response_content_type().cloned(),
      status_code: interaction_trail
        .get_response_status_code()
        .expect("MatchedResponseBodyContentType implies response to have a status code"),
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
#[derive(Clone, Debug, Deserialize, Serialize, Hash)]
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
      InteractionTrailPathComponent::ResponseStatusCode { status_code } => Some(*status_code),
      InteractionTrailPathComponent::Method { .. }
      | InteractionTrailPathComponent::RequestBody { .. }
      | InteractionTrailPathComponent::Url { .. } => None,
    })
  }

  pub fn matches_interaction(&self, interaction: &HttpInteraction) -> bool {
    #[derive(Default, Debug)]
    struct InteractionIdentifiers<'a> {
      path: Option<&'a String>,
      method: Option<&'a String>,
      request_content_type: Option<&'a String>,
      response_content_type: Option<&'a String>,
      response_status_code: Option<u16>,
    }

    impl<'a> From<&'a InteractionTrail> for InteractionIdentifiers<'a> {
      fn from(trail: &'a InteractionTrail) -> Self {
        trail.path.iter().fold(
          InteractionIdentifiers::default(),
          |mut identifiers, component| {
            match component {
              InteractionTrailPathComponent::Url { path } => {
                identifiers.path.replace(path);
              }
              InteractionTrailPathComponent::Method { method } => {
                identifiers.method.replace(method);
              }
              InteractionTrailPathComponent::RequestBody { content_type } => {
                identifiers.request_content_type.replace(content_type);
              }
              InteractionTrailPathComponent::ResponseStatusCode { status_code } => {
                identifiers.response_status_code.replace(*status_code);
              }
              InteractionTrailPathComponent::ResponseBody {
                content_type,
                status_code,
              } => {
                identifiers.response_status_code.replace(*status_code);
                identifiers.response_content_type.replace(content_type);
              }
            };
            identifiers
          },
        )
      }
    }

    let identifiers = InteractionIdentifiers::from(self);

    let conditions = [
      matches!(identifiers.path, Some(path) if path == &interaction.request.path),
      matches!(identifiers.method, Some(method) if method == &interaction.request.method),
      matches!(identifiers.response_status_code, Some(status_code) if status_code == interaction.response.status_code),
      identifiers.request_content_type == interaction.request.body.content_type.as_ref(),
      identifiers.response_content_type == interaction.response.body.content_type.as_ref(),
    ];
    // dbg!(&identifiers, &conditions);

    conditions.iter().all(|c| *c)
  }
}
////////////////////////////////////////////////////////////////////////////////
#[derive(Clone, Debug, Deserialize, Serialize, Hash)]
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

  pub fn get_request_id(&self) -> Option<&String> {
    match self {
      RequestSpecTrail::SpecRequestBody(spec_body) => Some(&spec_body.request_id),
      RequestSpecTrail::SpecRequestRoot(spec_body) => Some(&spec_body.request_id),
      _ => None,
    }
  }

  pub fn get_response_id(&self) -> Option<&String> {
    match self {
      RequestSpecTrail::SpecResponseBody(spec_body) => Some(&spec_body.response_id),
      RequestSpecTrail::SpecResponseRoot(spec_body) => Some(&spec_body.response_id),
      _ => None,
    }
  }
}

#[derive(Clone, Debug, Deserialize, Serialize, Hash)]
pub struct SpecRoot {}

#[derive(Clone, Debug, Deserialize, Serialize, Hash)]
#[serde(rename_all = "camelCase")]
pub struct SpecPath {
  pub path_id: PathComponentId,
}

#[derive(Clone, Debug, Deserialize, Serialize, Hash)]
#[serde(rename_all = "camelCase")]
pub struct SpecRequestRoot {
  pub request_id: RequestId,
}

#[derive(Clone, Debug, Deserialize, Serialize, Hash)]
#[serde(rename_all = "camelCase")]
pub struct SpecRequestBody {
  pub request_id: RequestId,
}

#[derive(Clone, Debug, Deserialize, Serialize, Hash)]
#[serde(rename_all = "camelCase")]
pub struct SpecResponseRoot {
  pub response_id: ResponseId,
}

#[derive(Clone, Debug, Deserialize, Serialize, Hash)]
#[serde(rename_all = "camelCase")]
pub struct SpecResponseBody {
  pub response_id: ResponseId,
}
//@GOTCHA make sure these serialize matching the existing scala code
#[derive(Clone, Debug, Deserialize, Serialize, Hash)]
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
