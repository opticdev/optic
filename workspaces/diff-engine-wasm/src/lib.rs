#![allow(dead_code, unused_imports, unused_variables)]

use wasm_bindgen::prelude::*;

use optic_diff_engine::{HttpInteraction, InteractionDiffResult, SpecEvent, SpecProjection};

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
pub fn diff_interaction(
  interaction_json: String,
  spec: &WasmSpecProjection,
) -> Result<String, JsValue> {
  let TaggedInput(interaction, tags): TaggedInput<HttpInteraction> =
    serde_json::from_str(&interaction_json).unwrap();

  let results = spec.diff_interaction(interaction);

  Ok(serde_json::to_string(&results).unwrap())
}

#[derive(Debug, serde::Deserialize, serde::Serialize)]
struct TaggedInput<T>(T, Tags);
type Tags = Vec<String>;

#[wasm_bindgen]
pub struct WasmSpecProjection {
  projection: SpecProjection,
}

impl WasmSpecProjection {
  pub fn diff_interaction(&self, interaction: HttpInteraction) -> Vec<InteractionDiffResult> {
    optic_diff_engine::diff_interaction(&self.projection, interaction)
  }
}

impl From<SpecProjection> for WasmSpecProjection {
  fn from(projection: SpecProjection) -> Self {
    Self { projection }
  }
}
