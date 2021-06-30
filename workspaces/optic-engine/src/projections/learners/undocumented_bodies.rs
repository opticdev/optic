use cqrs_core::{Aggregate, AggregateEvent, Event};
use log;
use serde::Serialize;
use std::collections::HashMap;

use crate::commands::{EndpointCommand, SpecCommand};
use crate::interactions::{BodyAnalysisLocation, BodyAnalysisResult};
use crate::learn_shape::TrailObservationsResult;
use crate::state::SpecIdGenerator;
use crate::JsonTrail;

#[derive(Default, Debug)]
pub struct LearnedUndocumentedBodiesProjection {
  observations_by_location: HashMap<BodyAnalysisLocation, TrailObservationsResult>,
}

impl LearnedUndocumentedBodiesProjection {
  fn with_body_analysis_result(&mut self, analysis: BodyAnalysisResult) {
    let existing_observations = self
      .observations_by_location
      .entry(analysis.body_location)
      .or_insert_with(|| TrailObservationsResult::default());

    existing_observations.union(analysis.trail_observations.normalized());
  }

  pub fn into_endpoint_bodies(
    self,
    id_generator: &mut impl SpecIdGenerator,
  ) -> impl Iterator<Item = EndpointBodies> {
    let mut endpoints_by_endpoint = HashMap::new();
    for (body_location, observations) in self.observations_by_location {
      let (root_shape_id, body_commands) =
        observations.into_commands(id_generator, &JsonTrail::empty());
      let mut endpoint_body = EndpointBody::new(&body_location, root_shape_id, body_commands);

      endpoint_body.append_endpoint_commands(id_generator);

      let (path_id, method) = match body_location {
        BodyAnalysisLocation::UnmatchedRequest {
          path_id, method, ..
        } => (path_id, method),
        BodyAnalysisLocation::UnmatchedRequestQueryParameters { path_id, method } => {
          (path_id, method)
        }
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
  query_parameters: Option<EndpointQueryParameters>,
  requests: Vec<EndpointRequestBody>,
  responses: Vec<EndpointResponseBody>,
}

impl EndpointBodies {
  pub fn new(path_id: String, method: String) -> Self {
    Self {
      path_id,
      method,

      query_parameters: None,
      requests: vec![],
      responses: vec![],
    }
  }

  pub fn push(&mut self, endpoint: EndpointBody) {
    match endpoint {
      EndpointBody::QueryParameters(endpoint_query_params) => {
        self.query_parameters = Some(endpoint_query_params);
      }
      EndpointBody::Request(endpoint_request) => {
        self.requests.push(endpoint_request);
      }
      EndpointBody::Response(endpoint_response) => {
        self.responses.push(endpoint_response);
      }
    }
  }

  pub fn into_commands(self) -> impl Iterator<Item = SpecCommand> {
    let requests_commands = self
      .requests
      .into_iter()
      .flat_map(|request| request.commands.into_iter());

    let responses_commands = self
      .responses
      .into_iter()
      .flat_map(|response| response.commands.into_iter());

    requests_commands.chain(responses_commands)
  }
}

#[derive(Debug)]
pub enum EndpointBody {
  QueryParameters(EndpointQueryParameters),
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
  #[serde(skip)]
  query_parameters_shape_id: Option<String>,

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
pub struct EndpointQueryParameters {
  commands: Vec<SpecCommand>,
  root_shape_id: Option<String>,

  #[serde(skip)]
  path_id: String,
  #[serde(skip)]
  method: String,
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
  ) -> Self {
    match body_location {
      BodyAnalysisLocation::UnmatchedRequest {
        path_id,
        method,
        content_type,
      } => {
        let body_descriptor = root_shape_id.map(|root_shape_id| EndpointBodyDescriptor {
          content_type: content_type
            .as_ref()
            .expect("root shape id implies a content type to be present")
            .clone(),
          root_shape_id,
        });

        EndpointBody::Request(EndpointRequestBody {
          body_descriptor,
          path_id: path_id.clone(),
          method: method.clone(),
          commands: body_commands.into_iter().collect(),
          query_parameters_shape_id: None,
        })
      }
      BodyAnalysisLocation::UnmatchedRequestQueryParameters { path_id, method } => {
        EndpointBody::QueryParameters(EndpointQueryParameters {
          path_id: path_id.clone(),
          method: method.clone(),
          root_shape_id: root_shape_id.clone(),
          commands: body_commands.into_iter().collect(),
        })
      }
      BodyAnalysisLocation::UnmatchedResponse {
        status_code,
        path_id,
        method,
        content_type,
      } => {
        let body_descriptor = root_shape_id.map(|root_shape_id| EndpointBodyDescriptor {
          content_type: content_type
            .as_ref()
            .expect("root shape id implies a content type to be present")
            .clone(),
          root_shape_id,
        });
        EndpointBody::Response(EndpointResponseBody {
          body_descriptor,
          path_id: path_id.clone(),
          method: method.clone(),
          commands: body_commands.into_iter().collect(),
          status_code: *status_code,
        })
      }
      _ => panic!("EndpointBody should only be created for unmatched responses and requests"),
    }
  }

  fn append_endpoint_commands(&mut self, ids: &mut impl SpecIdGenerator) {
    match self {
      EndpointBody::QueryParameters(query_parameters) => {
        let query_params_id = ids.request(); // TODO: give query params their own prefix

        query_parameters
          .commands
          .push(SpecCommand::from(EndpointCommand::add_query_parameters(
            query_params_id.clone(),
            query_parameters.path_id.clone(),
            query_parameters.method.clone(),
          )));

        if let Some(query_parameters_shape_id) = &query_parameters.root_shape_id {
          query_parameters.commands.push(SpecCommand::from(
            EndpointCommand::set_query_parameters_shape(
              query_params_id.clone(),
              query_parameters_shape_id.clone(),
              false,
            ),
          ))
        }
      }
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
              request_id.clone(),
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

#[cfg(test)]
mod test {
  use super::*;
  use crate::events::SpecEvent;
  use crate::interactions::InteractionDiffResult;
  use crate::learn_shape::observe_body_trails;
  use crate::projections::SpecProjection;
  use crate::state::body::BodyDescriptor;
  use insta::assert_debug_snapshot;
  use serde_json::json;

  #[test]
  fn undocumented_bodies_can_aggregate_analysis_results_with_array_items() {
    let body = BodyDescriptor::from(json!({
      "items": [132, "string-array-item"],
      "other-field": true
    }));

    let analysis_result = BodyAnalysisResult {
      body_location: BodyAnalysisLocation::UnmatchedResponse {
        path_id: String::from("test-path-1"),
        method: String::from("GET"),
        content_type: Some(String::from("application/json")),
        status_code: 200,
      },
      trail_observations: observe_body_trails(body),
    };

    let mut projection = LearnedUndocumentedBodiesProjection::default();

    projection.apply(analysis_result.clone());

    // dbg!(&projection);
    let aggregated_result = projection
      .observations_by_location
      .get(&analysis_result.body_location)
      .unwrap();

    let array_trail = JsonTrail::empty().with_object_key(String::from("items"));

    let items_values = aggregated_result
      .values_by_trail
      .get(&array_trail.with_array_item(0))
      .expect("should have learned values for items array");
    assert!(items_values.was_number && items_values.was_string);
    assert!(
      aggregated_result
        .values_by_trail
        .get(&array_trail.with_array_item(1))
        .is_none(),
      "undocumented endpoints projection aggregates normalized body results",
    );

    let mut aggregated_trails: Vec<_> = aggregated_result.trails().collect();
    aggregated_trails.sort();

    assert_debug_snapshot!(
      "undocumented_bodies_can_aggregate_analysis_results_with_array_items__aggregated_trails",
      aggregated_trails
    );
  }

  #[test]
  fn undocumented_bodies_generates_commands_for_request_query_parameters() {
    let test_path = "root";
    let test_method = "GET";
    let query_params_body = BodyDescriptor::from(json!({
      "search": "a-search-query",
      "page": "3"
    }));

    let analysis_results = vec![BodyAnalysisResult {
      // query params matching the preceding request
      body_location: BodyAnalysisLocation::UnmatchedRequestQueryParameters {
        path_id: String::from(test_path),
        method: String::from(test_method),
      },
      trail_observations: observe_body_trails(query_params_body.clone()),
    }];

    let mut test_id_generator = TestIdGenerator::default();
    let mut projection = LearnedUndocumentedBodiesProjection::default();

    for result in analysis_results {
      projection.apply(result);
    }

    let mut endpoint_bodies = projection
      .into_endpoint_bodies(&mut test_id_generator)
      .collect::<Vec<_>>();
    assert_eq!(endpoint_bodies.len(), 1);

    let endpoint_body = endpoint_bodies.remove(0);
    let query_param_commands = endpoint_body
      .query_parameters
      .expect("query parameters should have been learned")
      .commands;

    dbg!(query_param_commands);

    // TODO: remove snapshot
    // assert_debug_snapshot!(
    //   "undocumented_bodies_generates_commands_for_request_query_parameters__request_commands",
    //   &request_commands
    // );

    let base_spec = SpecProjection::default();
    // assert_valid_commands(base_spec, query_param_commands);
  }

  #[test]
  fn undocumented_bodies_can_generate_commands_for_request_with_empty_query_parameters() {
    let test_path = "root";
    let test_method = "GET";

    let analysis_results = vec![BodyAnalysisResult {
      body_location: BodyAnalysisLocation::UnmatchedRequestQueryParameters {
        path_id: String::from(test_path),
        method: String::from(test_method),
      },
      trail_observations: observe_body_trails(None),
    }];

    let mut test_id_generator = TestIdGenerator::default();
    let mut projection = LearnedUndocumentedBodiesProjection::default();

    for result in analysis_results {
      projection.apply(result);
    }

    let mut endpoint_bodies = projection
      .into_endpoint_bodies(&mut test_id_generator)
      .collect::<Vec<_>>();
    assert_eq!(endpoint_bodies.len(), 1);

    // TODO: remove snapshot
    // assert_debug_snapshot!(
    //   "undocumented_bodies_can_generate_commands_for_request_with_empty_query_parameters__request_commands",
    //   &request_commands
    // );

    let endpoint_body = endpoint_bodies.remove(0);
    let query_param_commands = endpoint_body
      .query_parameters
      .expect("query parameters should have been learned")
      .commands;

    dbg!(query_param_commands);

    let base_spec = SpecProjection::default();
    // assert_valid_commands(base_spec, query_param_commands);
  }

  #[test]
  fn undocumented_bodies_generates_commands_for_responses_without_bodies() {
    let analysis_result = BodyAnalysisResult {
      body_location: BodyAnalysisLocation::UnmatchedResponse {
        content_type: None,
        path_id: String::from("path-1"),
        method: String::from("DELETE"),
        status_code: 204,
      },
      trail_observations: observe_body_trails(None),
    };

    let mut test_id_generator = TestIdGenerator::default();
    let mut projection = LearnedUndocumentedBodiesProjection::default();

    projection.apply(analysis_result);

    let endpoint_bodies = projection
      .into_endpoint_bodies(&mut test_id_generator)
      .collect::<Vec<_>>();

    assert_debug_snapshot!(
      "undocumented_bodies_generates_commands_for_responses_without_bodies__endpoint_bodies",
      endpoint_bodies
    );
  }

  #[derive(Debug, Default)]
  struct TestIdGenerator {
    counter: usize,
  }

  impl SpecIdGenerator for TestIdGenerator {
    fn generate_id(&mut self, _prefix: &str) -> String {
      let id = format!("test-id-{}", self.counter);
      self.counter += 1;
      id
    }
  }

  fn assert_valid_commands(
    mut spec_projection: SpecProjection,
    commands: impl IntoIterator<Item = SpecCommand>,
  ) -> SpecProjection {
    // let mut spec_projection = SpecProjection::default();
    for command in commands {
      let events = spec_projection
        .execute(command)
        .expect("generated commands must be valid");

      for event in events {
        spec_projection.apply(event)
      }
    }

    spec_projection
  }
}
