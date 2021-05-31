// DO NOT EDIT! This file was generated via workspace-scripts/diff-engine/generate-tests
use insta::{assert_debug_snapshot, assert_json_snapshot};
use optic_engine::{diff_interaction, HttpInteraction, SpecEvent, SpecProjection};
use petgraph::dot::Dot;

#[test]
pub fn scenario_9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d() {
  let spec_file_path =  "tests/fixtures/domain-conflict-scenarios/events-9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d.json";
  let interactions_file_path = "tests/fixtures/domain-conflict-scenarios/interactions.json";
  let events = SpecEvent::from_file(spec_file_path).expect("should be able to deserialize events");
  let spec_projection = SpecProjection::from(events);
  assert_debug_snapshot!(
    "scenario_9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_json_snapshot!(
    "scenario_9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d__shape_json",
    &spec_projection.shapes_serializable()
  );
  assert_debug_snapshot!(
    "scenario_9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d__conflicts_graph",
    Dot::with_config(&spec_projection.conflicts().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d__spectacle_endpoints_graph",
    Dot::with_config(&spec_projection.spectacle_endpoints().graph, &[])
  );
  assert_json_snapshot!(
    "scenario_9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d__spectacle_endpoints_json",
    &spec_projection.spectacle_endpoints_serializable()
  );
  assert_debug_snapshot!(
    "scenario_9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d__spectacle_shapes",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_debug_snapshot!(
    "scenario_9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d__spectacle_contributions",
    &spec_projection.contributions().to_json_string()
  );

  let interactions_string = std::fs::read_to_string(interactions_file_path)
    .expect("expected interactions file to be readable");
  let interactions: Vec<HttpInteraction> = serde_json::from_str(&interactions_string).unwrap();
  for interaction in interactions {
    let label = format!("scenario_9949a8cc69a0063a70f5ae98672d8c23a1068a2b2d08f8bb7b9bbd968ec29f0d__interaction_{}__diffs", interaction.uuid.clone());
    let diffs = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!(label, diffs);
  }
}

#[test]
pub fn scenario_20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c() {
  let spec_file_path = "tests/fixtures/domain-conflict-scenarios/events-20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c.json";
  let interactions_file_path = "tests/fixtures/domain-conflict-scenarios/interactions.json";
  let events = SpecEvent::from_file(spec_file_path).expect("should be able to deserialize events");
  let spec_projection = SpecProjection::from(events);
  assert_debug_snapshot!(
    "scenario_20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_json_snapshot!(
    "scenario_20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c__shape_json",
    &spec_projection.shapes_serializable()
  );
  assert_debug_snapshot!(
    "scenario_20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c__conflicts_graph",
    Dot::with_config(&spec_projection.conflicts().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c__spectacle_endpoints_graph",
    Dot::with_config(&spec_projection.spectacle_endpoints().graph, &[])
  );
  assert_json_snapshot!(
    "scenario_20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c__spectacle_endpoints_json",
    &spec_projection.spectacle_endpoints_serializable()
  );
  assert_debug_snapshot!(
    "scenario_20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c__spectacle_shapes",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_debug_snapshot!(
    "scenario_20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c__spectacle_contributions",
    &spec_projection.contributions().to_json_string()
  );
  let interactions_string = std::fs::read_to_string(interactions_file_path)
    .expect("expected interactions file to be readable");
  let interactions: Vec<HttpInteraction> = serde_json::from_str(&interactions_string).unwrap();
  for interaction in interactions {
    let label = format!("scenario_20e9bda8afc0279258c5ac2c01b82c437aa1976e1eba23cb92096f7434d9316c__interaction_{}__diffs", interaction.uuid.clone());
    let diffs = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!(label, diffs);
  }
}

#[test]
pub fn scenario_af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229() {
  let spec_file_path = "tests/fixtures/domain-conflict-scenarios/events-af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229.json";
  let interactions_file_path = "tests/fixtures/domain-conflict-scenarios/interactions.json";
  let events = SpecEvent::from_file(spec_file_path).expect("should be able to deserialize events");
  let spec_projection = SpecProjection::from(events);

  assert_debug_snapshot!(
    "scenario_af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_json_snapshot!(
    "scenario_af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229__shape_json",
    &spec_projection.shapes_serializable()
  );
  assert_debug_snapshot!(
    "scenario_af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229__conflicts_graph",
    Dot::with_config(&spec_projection.conflicts().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229__spectacle_endpoints_graph",
    Dot::with_config(&spec_projection.spectacle_endpoints().graph, &[])
  );
  assert_json_snapshot!(
    "scenario_af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229__spectacle_endpoints_json",
    &spec_projection.spectacle_endpoints_serializable()
  );
  assert_debug_snapshot!(
    "scenario_af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229__spectacle_shapes",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_debug_snapshot!(
    "scenario_af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229__spectacle_contributions",
    &spec_projection.contributions().to_json_string()
  );
  let interactions_string = std::fs::read_to_string(interactions_file_path)
    .expect("expected interactions file to be readable");
  let interactions: Vec<HttpInteraction> = serde_json::from_str(&interactions_string).unwrap();
  for interaction in interactions {
    let label = format!("scenario_af20bd1d8e76cf9db0416175232b9b0276447f7148f3261f2d14b006aa7a0229__interaction_{}__diffs", interaction.uuid.clone());
    let diffs = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!(label, diffs);
  }
}

#[test]
pub fn scenario_1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9() {
  let spec_file_path = "tests/fixtures/domain-conflict-scenarios/events-1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9.json";
  let interactions_file_path = "tests/fixtures/domain-conflict-scenarios/interactions.json";
  let events = SpecEvent::from_file(spec_file_path).expect("should be able to deserialize events");
  let spec_projection = SpecProjection::from(events);

  assert_debug_snapshot!(
    "scenario_1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_json_snapshot!(
    "scenario_1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9__shape_json",
    &spec_projection.shapes_serializable()
  );
  assert_debug_snapshot!(
    "scenario_1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9__conflicts_graph",
    Dot::with_config(&spec_projection.conflicts().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9__spectacle_endpoints_graph",
    Dot::with_config(&spec_projection.spectacle_endpoints().graph, &[])
  );
  assert_json_snapshot!(
    "scenario_1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9__spectacle_endpoints_json",
    &spec_projection.spectacle_endpoints_serializable()
  );
  assert_debug_snapshot!(
    "scenario_1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9__spectacle_shapes",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_debug_snapshot!(
    "scenario_1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9__spectacle_contributions",
    &spec_projection.contributions().to_json_string()
  );
  let interactions_string = std::fs::read_to_string(interactions_file_path)
    .expect("expected interactions file to be readable");
  let interactions: Vec<HttpInteraction> = serde_json::from_str(&interactions_string).unwrap();
  for interaction in interactions {
    let label = format!("scenario_1f2c157783b46f9555f537046a7cb37cdde95466bd1af429b0f95f171a2bb4f9__interaction_{}__diffs", interaction.uuid.clone());
    let diffs = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!(label, diffs);
  }
}
