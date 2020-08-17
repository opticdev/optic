pub enum InteractionDiffResult {
  UnmatchedRequestMethod(UnmatchedRequestMethod),
}

pub struct UnmatchedRequestMethod {
  interaction_trail: InteractionTrail,
  requests_trail: RequestSpecTrail,
}

impl UnmatchedRequestMethod {
  pub fn new(interaction_trail: InteractionTrail, requests_trail: RequestSpecTrail) -> Self {
    return UnmatchedRequestMethod {
      interaction_trail,
      requests_trail,
    };
  }
}

pub struct InteractionTrail {
  pub path: Vec<InteractionTrailPathComponent>,
}
pub struct RequestSpecTrail {}

pub enum InteractionTrailPathComponent {
  Method(String),
}
