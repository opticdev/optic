#![allow(dead_code, unused_imports, unused_variables)]

use wasm_bindgen::prelude::*;

use optic_diff_engine::{
  Aggregate, HttpInteraction, InteractionDiffResult, SpecCommand, SpecEvent, SpecProjection,
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
pub fn try_apply_commands(commands_json: String, events_json: String) -> Result<String, JsValue> {
  let spec_commands: Vec<SpecCommand> = serde_json::from_str(&commands_json).unwrap();
  let spec_events: Vec<SpecEvent> = serde_json::from_str(&events_json).unwrap();
  let spec_projection = SpecProjection::from(spec_events);

  let final_state = spec_commands.into_iter().fold(
    (spec_projection, vec![]),
    |(mut projection, mut events), command| {
      let new_events = projection
        .execute(command)
        .expect("expected commands to apply");
      new_events.into_iter().for_each(|event| {
        projection.apply(event.clone());
        events.push(event);
      });
      (projection, events)
    },
  );
  let (_, new_events) = final_state;
  Ok(serde_json::to_string(&new_events).unwrap())
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
