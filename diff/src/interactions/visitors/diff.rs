use super::{
  InteractionVisitor, InteractionVisitors, PathVisitor, PathVisitorContext, RequestBodyVisitor,
  RequestBodyVisitorContext, ResponseBodyVisitor, ResponseBodyVisitorContext, VisitorResults,
};
use crate::interactions::diff::{
  InteractionDiffResult, SpecRoot, UnmatchedRequestBodyContentType, UnmatchedRequestUrl,
  UnmatchedResponseBodyContentType,
};
use crate::interactions::diff::{
  InteractionTrail, InteractionTrailPathComponent, RequestSpecTrail, SpecPath,
};
use crate::interactions::HttpInteraction;
use crate::state::endpoint::{RequestId, ResponseId};

pub struct DiffVisitors {
  path: DiffPathVisitor,
  request_body: DiffRequestBodyVisitor,
  response_body: DiffResponseBodyVisitor,
}

impl DiffVisitors {
  pub fn new() -> Self {
    DiffVisitors {
      path: DiffPathVisitor::new(),
      request_body: DiffRequestBodyVisitor::new(),
      response_body: DiffResponseBodyVisitor::new(),
    }
  }
}

type DiffResults = VisitorResults<InteractionDiffResult>;

impl InteractionVisitors<InteractionDiffResult> for DiffVisitors {
  type Path = DiffPathVisitor;
  type RequestBody = DiffRequestBodyVisitor;
  type ResponseBody = DiffResponseBodyVisitor;

  fn path(&mut self) -> &mut DiffPathVisitor {
    &mut self.path
  }
  fn request_body(&mut self) -> &mut DiffRequestBodyVisitor {
    &mut self.request_body
  }
  fn response_body(&mut self) -> &mut DiffResponseBodyVisitor {
    &mut self.response_body
  }
}
///////////////////////////////////////////////////////////////////////////////

pub struct DiffPathVisitor {
  results: DiffResults,
}

impl DiffPathVisitor {
  fn new() -> Self {
    DiffPathVisitor {
      results: DiffResults::new(),
    }
  }
}

impl InteractionVisitor<InteractionDiffResult> for DiffPathVisitor {
  fn results(&mut self) -> Option<&mut DiffResults> {
    Some(&mut self.results)
  }
}

impl PathVisitor<InteractionDiffResult> for DiffPathVisitor {
  fn visit(&mut self, interaction: &HttpInteraction, context: &PathVisitorContext) {
    if let None = context.path {
      let interaction_trail = InteractionTrail::empty();
      let requests_trail = RequestSpecTrail::SpecRoot(SpecRoot {});
      let diff = InteractionDiffResult::UnmatchedRequestUrl(UnmatchedRequestUrl::new(
        interaction_trail,
        requests_trail,
      ));
      self.push(diff);
    }
  }
}
///////////////////////////////////////////////////////////////////////////////

pub struct DiffRequestBodyVisitor {
  results: DiffResults,
  visited_with_matched_content_types: std::collections::HashSet<RequestId>,
  visited_with_unmatched_content_types: std::collections::HashSet<RequestId>,
}

impl DiffRequestBodyVisitor {
  fn new() -> Self {
    DiffRequestBodyVisitor {
      results: DiffResults::new(),
      visited_with_matched_content_types: std::collections::HashSet::new(),
      visited_with_unmatched_content_types: std::collections::HashSet::new(),
    }
  }
}

impl InteractionVisitor<InteractionDiffResult> for DiffRequestBodyVisitor {
  fn results(&mut self) -> Option<&mut DiffResults> {
    Some(&mut self.results)
  }
}
impl RequestBodyVisitor<InteractionDiffResult> for DiffRequestBodyVisitor {
  fn begin(&mut self) {
    // eeprintln!("begin");
  }

  fn visit(&mut self, interaction: &HttpInteraction, context: &RequestBodyVisitorContext) {
    if let Some(operation) = context.operation {
      let actual_content_type = &interaction.request.body.content_type;
      let (request_id, request_body_descriptor) = operation;
      eprintln!("actual request content type {:?}", actual_content_type);
      eprintln!(
        "expecting request content type {:?}",
        &request_body_descriptor
      );
      match (&request_body_descriptor.body, actual_content_type) {
        (None, None) => {
          self
            .visited_with_matched_content_types
            .insert(request_id.clone());
        }
        (None, Some(content_type)) => {
          self
            .visited_with_unmatched_content_types
            .insert(request_id.clone());
        }
        (Some(body), None) => {
          self
            .visited_with_unmatched_content_types
            .insert(request_id.clone());
        }
        (Some(body), Some(content_type)) => {
          if body.http_content_type == *content_type {
            self
              .visited_with_matched_content_types
              .insert(request_id.clone());
          } else {
            self
              .visited_with_unmatched_content_types
              .insert(request_id.clone());
          }
        }
      }
    }
  }

  fn end(&mut self, interaction: &HttpInteraction, context: &PathVisitorContext) {
    if let Some(path_id) = context.path {
      if self.visited_with_matched_content_types.is_empty() {
        let actual_content_type = &interaction.request.body.content_type;
        let mut interaction_trail_components = vec![
          InteractionTrailPathComponent::Url {},
          InteractionTrailPathComponent::Method {
            method: interaction.request.method.clone(),
          },
        ];
        if let Some(content_type) = actual_content_type {
          interaction_trail_components.push(InteractionTrailPathComponent::RequestBody {
            content_type: content_type.clone(),
          });
        }
        let interaction_trail = InteractionTrail::new(interaction_trail_components);
        let requests_trail = RequestSpecTrail::SpecPath(SpecPath {
          path_id: String::from(path_id),
        });
        let diff = InteractionDiffResult::UnmatchedRequestBodyContentType(
          UnmatchedRequestBodyContentType::new(interaction_trail, requests_trail),
        );
        self.results.push(diff);
      }
    }
  }
}
///////////////////////////////////////////////////////////////////////////////

pub struct DiffResponseBodyVisitor {
  results: DiffResults,
  visited_with_matched_content_types: std::collections::HashSet<ResponseId>,
  visited_with_unmatched_content_types: std::collections::HashSet<ResponseId>,
}

impl DiffResponseBodyVisitor {
  fn new() -> Self {
    DiffResponseBodyVisitor {
      results: DiffResults::new(),
      visited_with_matched_content_types: std::collections::HashSet::new(),
      visited_with_unmatched_content_types: std::collections::HashSet::new(),
    }
  }
}

impl InteractionVisitor<InteractionDiffResult> for DiffResponseBodyVisitor {
  fn results(&mut self) -> Option<&mut DiffResults> {
    Some(&mut self.results)
  }
}
impl ResponseBodyVisitor<InteractionDiffResult> for DiffResponseBodyVisitor {
  fn begin(&mut self) {
    eprintln!("begin response body visitor");
  }

  fn visit(&mut self, interaction: &HttpInteraction, context: &ResponseBodyVisitorContext) {
    eprintln!("visit response body");
    if let Some(response) = context.response {
      let actual_content_type = &interaction.response.body.content_type;
      let (response_id, response_body_descriptor) = response;
      eprintln!("actual response content type {:?}", actual_content_type);
      eprintln!(
        "expecting response content type {:?}",
        &response_body_descriptor
      );
      match (&response_body_descriptor.body, actual_content_type) {
        (None, None) => {
          self
            .visited_with_matched_content_types
            .insert(response_id.clone());
        }
        (None, Some(content_type)) => {
          self
            .visited_with_unmatched_content_types
            .insert(response_id.clone());
        }
        (Some(body), None) => {
          self
            .visited_with_unmatched_content_types
            .insert(response_id.clone());
        }
        (Some(body), Some(content_type)) => {
          if body.http_content_type == *content_type {
            self
              .visited_with_matched_content_types
              .insert(response_id.clone());
          } else {
            self
              .visited_with_unmatched_content_types
              .insert(response_id.clone());
          }
        }
      }
    }
  }

  fn end(&mut self, interaction: &HttpInteraction, context: &PathVisitorContext) {
    if let Some(path_id) = context.path {
      if self.visited_with_matched_content_types.is_empty() {
        let actual_content_type = &interaction.response.body.content_type;
        let mut interaction_trail_components = vec![
          //InteractionTrailPathComponent::Url(),
          InteractionTrailPathComponent::Method {
            method: interaction.request.method.clone(),
          },
        ];
        if let Some(content_type) = actual_content_type {
          interaction_trail_components.push(InteractionTrailPathComponent::ResponseBody {
            content_type: content_type.clone(),
            status_code: interaction.response.status_code,
          });
        } else {
          interaction_trail_components.push(InteractionTrailPathComponent::ResponseStatusCode {
            status_code: interaction.response.status_code,
          });
        }
        let interaction_trail = InteractionTrail::new(interaction_trail_components);
        let responses_trail = RequestSpecTrail::SpecPath(SpecPath {
          path_id: String::from(path_id),
        });
        let diff = InteractionDiffResult::UnmatchedResponseBodyContentType(
          UnmatchedResponseBodyContentType::new(interaction_trail, responses_trail),
        );
        self.results.push(diff);
      }
    }
  }
}
