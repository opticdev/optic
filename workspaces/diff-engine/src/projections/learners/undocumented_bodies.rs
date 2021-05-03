use cqrs_core::{Aggregate, AggregateEvent, Event};
use serde::Serialize;
use std::collections::HashMap;

use crate::commands::{EndpointCommand, SpecCommand};
use crate::interactions::{BodyAnalysisLocation, BodyAnalysisResult};
use crate::learn_shape::TrailObservationsResult;
use crate::state::SpecIdGenerator;

#[derive(Default, Debug)]
pub struct LearnedUndocumentedBodiesProjection {
  observations_by_body_location: HashMap<BodyAnalysisLocation, TrailObservationsResult>,
}

impl LearnedUndocumentedBodiesProjection {
  fn with_body_analysis_result(&mut self, analysis: BodyAnalysisResult) {
    let existing_observations = self
      .observations_by_body_location
      .entry(analysis.body_location)
      .or_insert_with(|| TrailObservationsResult::default());

    existing_observations.union(analysis.trail_observations);
  }

  pub fn into_endpoint_bodies(
    self,
    id_generator: &mut impl SpecIdGenerator,
  ) -> impl Iterator<Item = EndpointBodies> {
    let mut endpoints_by_endpoint = HashMap::new();
    for (body_location, observations) in self.observations_by_body_location {
      let (root_shape_id, body_commands, new_shape_id) = observations.into_commands(id_generator);
      let endpoint_body =
        EndpointBody::new(&body_location, root_shape_id, body_commands, id_generator);

      let (path_id, method) = match body_location {
        BodyAnalysisLocation::UnmatchedRequest {
          path_id, method, ..
        } => (path_id, method),
        BodyAnalysisLocation::UnmatchedResponse {
          path_id, method, ..
        } => (path_id, method),
        _ => unreachable!("analyzing undocumented bodies should only yield unmatched results"),
      };

      let endpoint_bodies = endpoints_by_endpoint
        .entry((path_id, method))
        .or_insert_with_key(|(path_id, method)| {
          EndpointBodies::new(path_id.clone(), method.clone())
        });

      endpoint_bodies.push(endpoint_body);
    }

    endpoints_by_endpoint.into_iter().map(|(k, v)| v)
  }
}

impl Aggregate for LearnedUndocumentedBodiesProjection {
  fn aggregate_type() -> &'static str {
    "learned_undocument_bodies"
  }
}

impl Event for BodyAnalysisResult {
  fn event_type(&self) -> &'static str {
    "body_analysis_result"
  }
}

impl AggregateEvent<LearnedUndocumentedBodiesProjection> for BodyAnalysisResult {
  fn apply_to(self, aggregate: &mut LearnedUndocumentedBodiesProjection) {
    aggregate.with_body_analysis_result(self)
  }
}

// Output structs
// --------------

#[derive(Default, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EndpointBodies {
  path_id: String,
  method: String,
  requests: Vec<EndpointRequestBody>,
  responses: Vec<EndpointResponseBody>,
}

impl EndpointBodies {
  pub fn new(path_id: String, method: String) -> Self {
    Self {
      path_id,
      method,
      requests: vec![],
      responses: vec![],
    }
  }

  pub fn push(&mut self, endpoint: EndpointBody) {
    match endpoint {
      EndpointBody::Request(endpoint_request) => {
        self.requests.push(endpoint_request);
      }
      EndpointBody::Response(endpoint_response) => {
        self.responses.push(endpoint_response);
      }
    }
  }
}

#[derive(Debug)]
pub enum EndpointBody {
  Request(EndpointRequestBody),
  Response(EndpointResponseBody),
}

#[derive(Default, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EndpointRequestBody {
  commands: Vec<SpecCommand>,

  #[serde(skip)]
  path_id: String,
  #[serde(skip)]
  method: String,

  #[serde(flatten)]
  body_descriptor: Option<EndpointBodyDescriptor>,
}

#[derive(Default, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EndpointResponseBody {
  commands: Vec<SpecCommand>,
  status_code: u16,

  #[serde(skip)]
  path_id: String,
  #[serde(skip)]
  method: String,

  #[serde(flatten)]
  body_descriptor: Option<EndpointBodyDescriptor>,
}

#[derive(Default, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EndpointBodyDescriptor {
  content_type: String,
  root_shape_id: String,
}

impl EndpointBody {
  fn new(
    body_location: &BodyAnalysisLocation,
    root_shape_id: Option<String>,
    body_commands: impl IntoIterator<Item = SpecCommand>,
    id_generator: &mut impl SpecIdGenerator,
  ) -> Self {
    let body_descriptor = match root_shape_id {
      Some(root_shape_id) => Some(EndpointBodyDescriptor {
        content_type: body_location
          .content_type()
          .expect("root shape id implies a content type to be present")
          .clone(),
        root_shape_id,
      }),
      None => None,
    };

    let mut body = match body_location {
      BodyAnalysisLocation::UnmatchedRequest {
        path_id, method, ..
      } => EndpointBody::Request(EndpointRequestBody {
        body_descriptor,
        path_id: path_id.clone(),
        method: method.clone(),
        commands: body_commands.into_iter().collect(),
      }),
      BodyAnalysisLocation::UnmatchedResponse {
        status_code,
        path_id,
        method,
        ..
      } => EndpointBody::Response(EndpointResponseBody {
        body_descriptor,
        path_id: path_id.clone(),
        method: method.clone(),
        commands: body_commands.into_iter().collect(),
        status_code: *status_code,
      }),
      _ => panic!("EndpointBody should only be created for unmatched responses and requests"),
    };

    body.append_endpoint_commands(id_generator);

    body
  }

  fn append_endpoint_commands(&mut self, ids: &mut impl SpecIdGenerator) {
    match self {
      EndpointBody::Request(request_body) => {
        let request_id = ids.request();
        request_body
          .commands
          .push(SpecCommand::from(EndpointCommand::add_request(
            request_id.clone(),
            request_body.path_id.clone(),
            request_body.method.clone(),
          )));

        if let Some(body_descriptor) = &request_body.body_descriptor {
          request_body
            .commands
            .push(SpecCommand::from(EndpointCommand::set_request_body_shape(
              request_id,
              body_descriptor.root_shape_id.clone(),
              body_descriptor.content_type.clone(),
              false,
            )));
        }
      }
      EndpointBody::Response(response_body) => {
        let response_id = ids.response();
        response_body.commands.push(SpecCommand::from(
          EndpointCommand::add_response_by_path_and_method(
            response_id.clone(),
            response_body.path_id.clone(),
            response_body.method.clone(),
            response_body.status_code.clone(),
          ),
        ));

        if let Some(body_descriptor) = &response_body.body_descriptor {
          response_body
            .commands
            .push(SpecCommand::from(EndpointCommand::set_response_body_shape(
              response_id,
              body_descriptor.root_shape_id.clone(),
              body_descriptor.content_type.clone(),
              false,
            )));
        }
      }
    };
  }
}
