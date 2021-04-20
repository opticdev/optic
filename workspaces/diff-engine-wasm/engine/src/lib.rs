#![allow(dead_code, unused_imports, unused_variables)]

use chrono::Utc;
use uuid::Uuid;
use wasm_bindgen::prelude::*;

use optic_diff_engine::{
  Aggregate, CommandContext, EndpointQueries, HttpInteraction, InteractionDiffResult, SpecCommand,
  SpecEvent, SpecProjection,
};

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
) -> Result<String, JsValue> {
  let spec_commands: Vec<SpecCommand> = serde_json::from_str(&commands_json).unwrap();
  let spec_events: Vec<SpecEvent> = serde_json::from_str(&events_json).unwrap();
  let spec_projection = SpecProjection::from(spec_events);
  let batch_command_context = CommandContext::new(
    batch_id.clone(),
    String::from("diff-engine-wasm-user"),
    String::from("diff-engine-wasm-session"),
    Utc::now(),
  );

  let mut batch =
    optic_diff_engine::append_batch_to_spec(spec_projection, commit_message, batch_command_context);

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
pub struct WasmSpecProjection {
  projection: SpecProjection,
}

impl WasmSpecProjection {
  pub fn diff_interaction(&self, interaction: HttpInteraction) -> Vec<InteractionDiffResult> {
    optic_diff_engine::diff_interaction(&self.projection, interaction)
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
    optic_diff_engine::append_batch_to_spec(spec.projection, commit_message, batch_command_context);

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
