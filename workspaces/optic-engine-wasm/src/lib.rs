#![allow(dead_code, unused_imports, unused_variables)]

use chrono::Utc;
use nanoid::nanoid;
use optic_engine::{
  analyze_undocumented_bodies, Aggregate, Body, BodyAnalysisResult, CommandContext,
  EndpointQueries, HttpInteraction, InteractionDiffResult, JsonTrail,
  LearnedShapeDiffAffordancesProjection, LearnedUndocumentedBodiesProjection,
  ResponseBodyDescriptor, ResponseId, SpecCommand, SpecEvent, SpecIdGenerator, SpecProjection,
  TaggedInput, TrailObservationsResult, TrailValues,
};
use std::collections::HashMap;
use uuid::Uuid;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn init() {
  wasm_logger::init(wasm_logger::Config::default());
  std::panic::set_hook(Box::new(console_error_panic_hook::hook));
}

#[wasm_bindgen]
pub fn spec_from_events(spec_json: String) -> Result<WasmSpecProjection, JsValue> {
  let spec_events: Vec<SpecEvent> = serde_json::from_str(&spec_json).unwrap();
  let spec_projection = SpecProjection::from(spec_events);

  Ok(WasmSpecProjection::from(spec_projection))
}

#[wasm_bindgen]
pub fn get_endpoints_projection(spec: &WasmSpecProjection) -> Result<String, JsValue> {
  spec.spectacle_endpoints_projection()
}
#[wasm_bindgen]
pub fn get_shapes_projection(spec: &WasmSpecProjection) -> Result<String, JsValue> {
  spec.spectacle_shapes_projection()
}
#[wasm_bindgen]
pub fn get_shape_viewer_projection(spec: &WasmSpecProjection) -> Result<String, JsValue> {
  spec.spectacle_shape_viewer_projection()
}
#[wasm_bindgen]
pub fn get_contributions_projection(spec: &WasmSpecProjection) -> Result<String, JsValue> {
  spec.spectacle_contributions_projection()
}

#[wasm_bindgen]
pub fn diff_interaction(
  interaction_json: String,
  spec: &WasmSpecProjection,
) -> Result<String, JsValue> {
  let interaction: HttpInteraction = serde_json::from_str(&interaction_json).unwrap();

  let results: Vec<ResultContainer<InteractionDiffResult>> = spec
    .diff_interaction(interaction)
    .into_iter()
    .map(|result| result.into())
    .collect();

  Ok(serde_json::to_string(&results).unwrap())
}

#[wasm_bindgen]
pub fn try_apply_commands(
  commands_json: String,
  events_json: String,
  batch_id: String,
  commit_message: String,
  client_id: String,
  client_session_id: String,
) -> Result<String, JsValue> {
  let spec_commands: Vec<SpecCommand> = serde_json::from_str(&commands_json).unwrap();
  let spec_events: Vec<SpecEvent> = serde_json::from_str(&events_json).unwrap();
  let spec_projection = SpecProjection::from(spec_events);
  let batch_command_context =
    CommandContext::new(batch_id.clone(), client_id, client_session_id, Utc::now());

  let mut batch =
    optic_engine::append_batch_to_spec(spec_projection, commit_message, batch_command_context);

  for command in spec_commands {
    batch
      .with_command(command)
      .map_err(|err| format!("command could not be applied: {:?}", err))?;
  }

  let new_events = batch.commit();

  serde_json::to_string(&new_events)
    .map_err(|err| JsValue::from(format!("new events could not be serialized: {:?}", err)))
}

#[wasm_bindgen]
pub fn affordances_to_commands(
  json_affordances_json: String,
  json_trail_json: String,
  id_generator_strategy: String,
) -> Result<String, JsValue> {
  let values_by_trail_vec: Vec<TrailValues> = serde_json::from_str(&json_affordances_json).unwrap();
  let json_trail: JsonTrail = serde_json::from_str(&json_trail_json).unwrap();
  let values_by_trail_map: HashMap<_, _> = values_by_trail_vec
    .into_iter()
    .map(|item| (item.trail.clone(), item))
    .collect();
  let trail_observation_results: TrailObservationsResult = TrailObservationsResult {
    values_by_trail: values_by_trail_map,
  };

  let result: (Vec<SpecCommand>, String) = if id_generator_strategy == "sequential" {
    let mut sequential_id_generator = SequentialIdGenerator { next_id: 9999 };
    let (root_shape_id_option, commands_iter) =
      trail_observation_results.into_commands(&mut sequential_id_generator, &json_trail);
    (commands_iter.collect(), root_shape_id_option.unwrap())
  } else {
    let mut nano_id_generator = NanoIdGenerator::default();
    let (root_shape_id_option, commands_iter) =
      trail_observation_results.into_commands(&mut nano_id_generator, &json_trail);
    (commands_iter.collect(), root_shape_id_option.unwrap())
  };

  serde_json::to_string(&result)
    .map_err(|err| JsValue::from(format!("new commands could not be serialized: {:?}", err)))
}

#[wasm_bindgen]
pub fn learn_undocumented_bodies(
  spec: &WasmSpecProjection,
  interactions_json: String,
  id_generator_strategy: String,
) -> Result<String, JsValue> {
  let interactions = serde_json::Deserializer::from_str(&interactions_json).into_iter();

  let mut learned_undocumented_bodies = LearnedUndocumentedBodiesProjection::default();
  for interaction_parse_result in interactions {
    let interaction: HttpInteraction = interaction_parse_result
      .map_err(|err| JsValue::from(format!("could not parse interaction json: {}", err)))?;

    let results = spec.analyze_undocumented_bodies(interaction);

    for result in results {
      learned_undocumented_bodies.apply(result)
    }
  }

  let mut sequential_id_generator = SequentialIdGenerator { next_id: 6666 };
  let mut nano_id_generator = NanoIdGenerator::default();
  let endpoint_bodies = if id_generator_strategy == "sequential" {
    learned_undocumented_bodies
      .into_endpoint_bodies(&mut sequential_id_generator)
      .collect::<Vec<_>>()
  } else {
    learned_undocumented_bodies
      .into_endpoint_bodies(&mut nano_id_generator)
      .collect::<Vec<_>>()
  };

  serde_json::to_string(&endpoint_bodies).map_err(|err| {
    JsValue::from(format!(
      "endpoint bodies could not be serialized: {:?}",
      err
    ))
  })
}

// TODO: consider whether to accept 1 interaction at the time and return a control flow struct,
// to allow for unbound amount of interactions
#[wasm_bindgen]
pub fn learn_shape_diff_affordances(
  spec: &WasmSpecProjection,
  diff_results_json: String,
  tagged_interactions_json: String,
) -> Result<String, JsValue> {
  let diff_results = serde_json::from_str::<Vec<InteractionDiffResult>>(&diff_results_json)
    .map_err(|err| JsValue::from(format!("could not parse diff results: {}", err)))?;
  let interactions = serde_json::Deserializer::from_str(&tagged_interactions_json).into_iter();

  let mut learned_shape_diff_affordances =
    LearnedShapeDiffAffordancesProjection::from(diff_results);

  for interaction_parse_result in interactions {
    let TaggedInput(interaction, interaction_pointers): TaggedInput<HttpInteraction> =
      interaction_parse_result
        .map_err(|err| JsValue::from(format!("could not parse interaction json: {}", err)))?;

    let results = spec
      .analyze_documented_bodies(interaction)
      .map(|result| TaggedInput(result, interaction_pointers.clone()));

    for result in results {
      learned_shape_diff_affordances.apply(result)
    }
  }

  let shape_diff_affordances = learned_shape_diff_affordances
    .into_iter()
    .collect::<Vec<_>>();

  serde_json::to_string(&shape_diff_affordances).map_err(|err| {
    JsValue::from(format!(
      "shape diff affordances could not be serialized: {}",
      err
    ))
  })
}

#[wasm_bindgen]
pub struct WasmSpecProjection {
  projection: SpecProjection,
}

impl WasmSpecProjection {
  pub fn diff_interaction(&self, interaction: HttpInteraction) -> Vec<InteractionDiffResult> {
    optic_engine::diff_interaction(&self.projection, interaction)
  }
  fn analyze_undocumented_bodies(
    &self,
    interaction: HttpInteraction,
  ) -> impl Iterator<Item = BodyAnalysisResult> {
    optic_engine::analyze_undocumented_bodies(&self.projection, interaction)
  }

  fn analyze_documented_bodies(
    &self,
    interaction: HttpInteraction,
  ) -> impl Iterator<Item = BodyAnalysisResult> {
    optic_engine::analyze_documented_bodies(&self.projection, interaction)
  }

  pub fn spectacle_endpoints_projection(&self) -> Result<String, JsValue> {
    let serialized = self.projection.spectacle_endpoints().to_json_string();
    Ok(serialized)
  }
  pub fn spectacle_shapes_projection(&self) -> Result<String, JsValue> {
    let serialized = self.projection.shape().to_json_string();
    Ok(serialized)
  }
  pub fn spectacle_shape_viewer_projection(&self) -> Result<String, JsValue> {
    let serialized = serde_json::to_string(&self.projection.shape().to_choice_mapping());
    Ok(serialized.unwrap())
  }
  pub fn spectacle_contributions_projection(&self) -> Result<String, JsValue> {
    let serialized = self.projection.contributions().to_json_string();
    Ok(serialized)
  }

  pub fn endpoint_queries(&self) -> EndpointQueries {
    EndpointQueries::new(self.projection.endpoint())
  }
}

impl From<SpecProjection> for WasmSpecProjection {
  fn from(projection: SpecProjection) -> Self {
    Self { projection }
  }
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct ResultContainer<T>(T, String);

impl From<InteractionDiffResult> for ResultContainer<InteractionDiffResult> {
  fn from(result: InteractionDiffResult) -> Self {
    let fingerprint = result.fingerprint();
    Self(result, fingerprint)
  }
}

// Commit batch
// ------------

#[wasm_bindgen]
pub fn append_batch_to_spec(
  spec: WasmSpecProjection,
  commands: String,
  commit_message: String,
) -> Result<String, JsValue> {
  let commands: Vec<SpecCommand> = serde_json::from_str(&commands).unwrap();
  let batch_id = Uuid::new_v4().to_hyphenated().to_string();
  let batch_command_context = CommandContext::new(
    batch_id.clone(),
    String::from("diff-engine-wasm-user"),
    String::from("diff-engine-wasm-session"),
    Utc::now(),
  );

  let mut batch =
    optic_engine::append_batch_to_spec(spec.projection, commit_message, batch_command_context);

  for command in commands {
    batch
      .with_command(command)
      .map_err(|err| format!("command could not be applied: {:?}", err))?;
  }

  let new_events = batch.commit();

  serde_json::to_string(&new_events)
    .map_err(|err| JsValue::from(format!("new events could not be serialized: {:?}", err)))
}

// Spec Queries
// ------------
#[wasm_bindgen]
pub fn spec_resolve_path_id(spec: &WasmSpecProjection, path: String) -> Option<String> {
  let endpoint_queries = spec.endpoint_queries();

  endpoint_queries.resolve_path(&path).map(String::from)
}

#[wasm_bindgen]
pub fn spec_resolve_requests(
  spec: &WasmSpecProjection,
  path_id: String,
  method: String,
) -> Result<String, JsValue> {
  let endpoint_queries = spec.endpoint_queries();

  let requests = endpoint_queries
    .resolve_requests(&path_id, &method)
    .map(|it| it.collect())
    .unwrap_or(vec![]);

  serde_json::to_string(&requests)
    .map_err(|err| JsValue::from(format!("requests could not be serialized: {:?}", err)))
}

#[wasm_bindgen]
pub fn spec_resolve_request(
  spec: &WasmSpecProjection,
  path_id: String,
  method: String,
  content_type: Option<String>,
) -> Result<String, JsValue> {
  let endpoint_queries = spec.endpoint_queries();

  let response = endpoint_queries.resolve_request_by_method_and_content_type(
    &path_id,
    &method,
    content_type.as_ref(),
  );

  serde_json::to_string(&response)
    .map_err(|err| JsValue::from(format!("responses could not be serialized: {:?}", err)))
}

#[wasm_bindgen]
pub fn spec_resolve_responses(
  spec: &WasmSpecProjection,
  method: String,
  status_code: u16,
  path_id: String,
) -> Result<String, JsValue> {
  let endpoint_queries = spec.endpoint_queries();

  let responses: Vec<(&ResponseId, &ResponseBodyDescriptor)> = endpoint_queries
    .resolve_responses_by_method_and_status_code(&method, status_code, &path_id)
    .collect();

  serde_json::to_string(&responses)
    .map_err(|err| JsValue::from(format!("responses could not be serialized: {:?}", err)))
}

#[wasm_bindgen]
pub fn spec_resolve_response(
  spec: &WasmSpecProjection,
  method: String,
  status_code: u16,
  path_id: String,
  content_type: Option<String>,
) -> Result<String, JsValue> {
  let endpoint_queries = spec.endpoint_queries();

  let response = endpoint_queries.resolve_response_by_method_status_code_and_content_type(
    &path_id,
    &method,
    status_code,
    content_type.as_ref(),
  );

  serde_json::to_string(&response)
    .map_err(|err| JsValue::from(format!("responses could not be serialized: {:?}", err)))
}

////////////////////////////////////////////////////////////////////////////////////////////////
#[wasm_bindgen]
pub fn next_nano_id(prefix: String) -> String {
  let mut nano_id_generator = NanoIdGenerator::default();
  nano_id_generator.generate_id(&prefix)
}
#[derive(Debug, Default)]
struct NanoIdGenerator {}
impl SpecIdGenerator for NanoIdGenerator {
  fn generate_id(&mut self, prefix: &str) -> String {
    // NanoID @ 10 chars:
    // - URL-safe,
    // - 17 years for a 1% chance of at least one global collision assuming
    //   writing 1000 ids per hour (https://zelark.github.io/nano-id-cc/)
    format!("{}{}", prefix, nanoid!(10))
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
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
