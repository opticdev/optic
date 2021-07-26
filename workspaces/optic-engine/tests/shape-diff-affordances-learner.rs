use insta::assert_debug_snapshot;
// use petgraph::dot::Dot;
use serde::Deserialize;
use std::collections::HashSet;
use std::path::Path;
use tokio::fs::read_to_string;

use optic_engine::{
  analyze_documented_bodies, diff_interaction, Aggregate, DiffInteractionConfig, HttpInteraction,
  LearnedShapeDiffAffordancesProjection, SpecCommand, SpecEvent, SpecIdGenerator, SpecProjection,
  TaggedInput,
};

#[tokio::main]
#[test]
async fn query_param_required_but_missing() {
  let mut capture = DebugCapture::from_name("query_param_required_but_missing.json").await;
  let spec = SpecProjection::from(capture.events);
  let interaction = capture.session.samples.remove(0);
  let interaction_pointer = String::from("test-interaction-1");

  let diff_results = diff_interaction(
    &spec,
    interaction.clone(),
    &DiffInteractionConfig::default(),
  );

  let mut learned_shape_diff_affordances =
    LearnedShapeDiffAffordancesProjection::from(diff_results);

  let results = analyze_documented_bodies(&spec, interaction).filter(|result| {
    matches!(
      result.body_location,
      optic_engine::BodyAnalysisLocation::MatchedQueryParameters { .. }
    )
  });

  for result in results {
    dbg!(&result);
    let pointers = {
      let mut set = HashSet::new();
      set.insert(interaction_pointer.clone());
      set
    };
    learned_shape_diff_affordances.apply(TaggedInput(result, pointers));
  }

  dbg!(&learned_shape_diff_affordances);

  let mut shape_diff_affordances = learned_shape_diff_affordances
    .into_iter()
    .collect::<Vec<_>>();

  assert_debug_snapshot!(
    "query_param_required_but_missing__shape_diff_affordances",
    &shape_diff_affordances
  );

  let mut id_generator = SequentialIdGenerator { next_id: 1093 }; // <3 primes

  dbg!(&shape_diff_affordances);

  let (_root_shape_id, commands) = {
    let shape_diff_affordances = shape_diff_affordances.remove(0).1;
    let (json_trail, trail_observation_results) = shape_diff_affordances.into_trail_observations();
    trail_observation_results.into_commands(&mut id_generator, &json_trail)
  };

  dbg!(commands.collect::<Vec<_>>());
}

#[tokio::main]
#[test]
async fn query_param_new_and_optional() {
  let capture = DebugCapture::from_name("query_param_new_and_optional.json").await;
  let spec = SpecProjection::from(capture.events);

  let diff_results = capture
    .session
    .samples
    .iter()
    .flat_map(|interaction| {
      diff_interaction(
        &spec,
        interaction.clone(),
        &DiffInteractionConfig::default(),
      )
    })
    .collect::<Vec<_>>();

  let mut learned_shape_diff_affordances =
    LearnedShapeDiffAffordancesProjection::from(diff_results);

  for interaction in capture.session.samples {
    let interaction_pointer = interaction.uuid.clone();
    let results = analyze_documented_bodies(&spec, interaction).filter(|result| {
      matches!(
        result.body_location,
        optic_engine::BodyAnalysisLocation::MatchedQueryParameters { .. }
      )
    });

    for result in results {
      let pointers = {
        let mut set = HashSet::new();
        set.insert(interaction_pointer.clone());
        set
      };
      learned_shape_diff_affordances.apply(TaggedInput(result, pointers));
    }
  }

  let shape_diff_affordances = learned_shape_diff_affordances
    .into_iter()
    .collect::<Vec<_>>();

  assert_debug_snapshot!(
    "query_param_new_and_optional__shape_diff_affordances",
    &shape_diff_affordances
  );
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
      .join("tests/fixtures/shape-diff-affordances-learner")
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

fn _assert_valid_commands(
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
