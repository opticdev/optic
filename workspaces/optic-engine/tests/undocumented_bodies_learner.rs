// use insta::assert_debug_snapshot;
// use petgraph::dot::Dot;
use serde::Deserialize;
use std::path::Path;
use tokio::fs::read_to_string;

use optic_engine::{
  analyze_undocumented_bodies, Aggregate, AnalyzeUndocumentedBodiesConfig, EndpointCommand,
  HttpInteraction, LearnedUndocumentedBodiesProjection, SpecCommand, SpecEvent, SpecIdGenerator,
  SpecProjection,
};

#[tokio::main]
#[test]
async fn get_request_with_query_params() {
  let mut capture = DebugCapture::from_name("get-request-with-query-params.json").await;

  let spec = SpecProjection::from(capture.events);
  let interaction = capture.session.samples.remove(0);

  let mut learned_undocumented_bodies = LearnedUndocumentedBodiesProjection::default();

  let learner_config = AnalyzeUndocumentedBodiesConfig::default().with_query_params(true);

  let results = analyze_undocumented_bodies(&spec, interaction, &learner_config);

  for result in results {
    learned_undocumented_bodies.apply(result)
  }

  let mut id_generator = SequentialIdGenerator { next_id: 1093 }; // <3 primes

  let endpoint_bodies = learned_undocumented_bodies
    .into_endpoint_bodies(&mut id_generator)
    .next()
    .expect("an endpoint should have been learned for");

  let commands = endpoint_bodies.into_commands().collect::<Vec<_>>();

  assert!(commands
    .iter()
    .find(|command| matches!(
      command,
      SpecCommand::EndpointCommand(EndpointCommand::AddQueryParameters(_))
    ))
    .is_some());

  assert!(commands
    .iter()
    .find(|command| matches!(
      command,
      SpecCommand::EndpointCommand(EndpointCommand::SetQueryParametersShape(_))
    ))
    .is_some());

  let _updated_spec = assert_valid_commands(spec, commands);

  // TODO: assert snapshots on these once we figure out how to get stable ids to be generated
  // dbg!(Dot::with_config(&_updated_spec.endpoint().graph, &[]));
  // dbg!(Dot::with_config(&_updated_spec.shape().graph, &[]));
}

#[tokio::main]
#[test]
async fn get_request_with_object_query_params() {
  let mut capture = DebugCapture::from_name("get-request-with-object-query-params.json").await;

  let spec = SpecProjection::from(capture.events);
  let interaction = capture.session.samples.remove(0);

  let mut learned_undocumented_bodies = LearnedUndocumentedBodiesProjection::default();

  let learner_config = AnalyzeUndocumentedBodiesConfig::default().with_query_params(true);
  let results = analyze_undocumented_bodies(&spec, interaction, &learner_config);

  for result in results {
    learned_undocumented_bodies.apply(result)
  }

  let mut id_generator = SequentialIdGenerator { next_id: 1093 }; // <3 primes

  let endpoint_bodies = learned_undocumented_bodies
    .into_endpoint_bodies(&mut id_generator)
    .next()
    .expect("an endpoint should have been learned for");

  let _updated_spec = assert_valid_commands(spec, endpoint_bodies.into_commands());

  // TODO: assert snapshots on these once we figure out how to get stable ids to be generated
  // dbg!(Dot::with_config(&_updated_spec.endpoint().graph, &[]));
  // dbg!(Dot::with_config(&_updated_spec.shape().graph, &[]));
}

#[tokio::main]
#[test]
async fn requests_with_and_without_query_params() {
  let capture = DebugCapture::from_name("requests-with-and-without-query-params.json").await;
  let spec = SpecProjection::from(capture.events);

  let mut learned_undocumented_bodies = LearnedUndocumentedBodiesProjection::default();

  let learner_config = AnalyzeUndocumentedBodiesConfig::default().with_query_params(true);

  for interaction in capture.session.samples {
    let results = analyze_undocumented_bodies(&spec, interaction, &learner_config);

    for result in results {
      learned_undocumented_bodies.apply(result)
    }
  }

  let mut id_generator = SequentialIdGenerator { next_id: 1093 }; // <3 primes

  let endpoint_bodies = learned_undocumented_bodies
    .into_endpoint_bodies(&mut id_generator)
    .next()
    .expect("an endpoint should have been learned for");

  let commands = endpoint_bodies.into_commands().collect::<Vec<_>>();

  dbg!(&commands);

  let _updated_spec = assert_valid_commands(spec, commands);

  // TODO: assert snapshots on these once we figure out how to get stable ids to be generated
  // dbg!(Dot::with_config(&_updated_spec.endpoint().graph, &[]));
  // dbg!(Dot::with_config(&_updated_spec.shape().graph, &[]));
}

#[derive(Deserialize, Debug)]
struct DebugCapture {
  events: Vec<SpecEvent>,
  session: DebugCaptureSession,
}

impl DebugCapture {
  async fn from_name(capture_name: &str) -> Self {
    let capture_path = std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/undocumented-bodies-learner")
      .join(capture_name);

    Self::from_file(capture_path).await
  }

  async fn from_file(capture_path: impl AsRef<Path>) -> Self {
    let capture_json = read_to_string(capture_path)
      .await
      .expect("should be able to read the debug capture");

    serde_json::from_str(&capture_json).expect("should be able to deserialize the debug capture")
  }
}

#[derive(Deserialize, Debug)]
struct DebugCaptureSession {
  samples: Vec<HttpInteraction>,
}

#[derive(Debug, Default)]
struct SequentialIdGenerator {
  next_id: u32,
}
impl SpecIdGenerator for SequentialIdGenerator {
  fn generate_id(&mut self, prefix: &str) -> String {
    self.next_id += 1;
    format!("{}{}", prefix, self.next_id.to_string())
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
