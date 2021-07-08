#![recursion_limit = "2560"]
use insta::assert_debug_snapshot;
use insta::assert_json_snapshot;
use optic_engine::{
  diff_interaction, DiffInteractionConfig, HttpInteraction, SpecEvent, SpecProjection,
};
use petgraph::dot::Dot;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs::File;
use std::path::Path;
use tokio::fs::read_to_string;

#[tokio::main]
#[test]
async fn scenario_1() {
  let capture = DebugCapture::from_name("scenario_1.json").await;
  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_1__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_1__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_1__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_1__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_1__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_2() {
  let capture = DebugCapture::from_name("scenario_2.json").await;
  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_2__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_2__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_2__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_2__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_2__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_3() {
  let capture = DebugCapture::from_name("scenario_3.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_3__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_3__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_3__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_3__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_3__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_4() {
  let capture = DebugCapture::from_name("scenario_4.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_4__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_4__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_4__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_4__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_4__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_5() {
  let capture = DebugCapture::from_name("scenario_5.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_5__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_5__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_5__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_5__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_5__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_6() {
  let capture = DebugCapture::from_name("scenario_6.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_6__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_6__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_6__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_6__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_6__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_7() {
  let capture = DebugCapture::from_name("scenario_7.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_7__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_7__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_7__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_7__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_7__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_8() {
  let capture = DebugCapture::from_name("scenario_8.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_8__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_8__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_8__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_8__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_8__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_9() {
  let capture = DebugCapture::from_name("scenario_9.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_9__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_9__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_9__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_9__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_9__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_10() {
  let capture = DebugCapture::from_name("scenario_10.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_10__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_10__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_10__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_10__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_10__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_11() {
  let capture = DebugCapture::from_name("scenario_11.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_11__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_11__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_11__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_11__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_11__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_12() {
  let capture = DebugCapture::from_name("scenario_12.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_12__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_12__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_12__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_12__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_12__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_13() {
  let capture = DebugCapture::from_name("scenario_13.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_13__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_13__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_13__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_13__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_13__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_14() {
  let capture = DebugCapture::from_name("scenario_14.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_14__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_14__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_14__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_14__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_14__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_15() {
  let capture = DebugCapture::from_name("scenario_15.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_15__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_15__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_15__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_15__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_15__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_16() {
  let capture = DebugCapture::from_name("scenario_16.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_16__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_16__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_16__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_16__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_16__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_17() {
  let capture = DebugCapture::from_name("scenario_17.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_17__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_17__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_17__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_17__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_17__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_18() {
  let capture = DebugCapture::from_name("scenario_18.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_18__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_18__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_18__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_18__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_18__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_19() {
  let capture = DebugCapture::from_name("scenario_19.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_19__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_19__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_19__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_19__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_19__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_20() {
  let capture = DebugCapture::from_name("scenario_20.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_20__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_20__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_20__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_20__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_20__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_21() {
  let capture = DebugCapture::from_name("scenario_21.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_21__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_21__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_21__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_21__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_21__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_22() {
  let capture = DebugCapture::from_name("scenario_22.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_22__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_22__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_22__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_22__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_22__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_23() {
  let capture = DebugCapture::from_name("scenario_23.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_23__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_23__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_23__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_23__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_23__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_24() {
  let capture = DebugCapture::from_name("scenario_24.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_24__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_24__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_24__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_24__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_24__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_25() {
  let capture = DebugCapture::from_name("scenario_25.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_25__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_25__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_25__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_25__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_25__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_26() {
  let capture = DebugCapture::from_name("scenario_26.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_26__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_26__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_26__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_26__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_26__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_27() {
  let capture = DebugCapture::from_name("scenario_27.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_27__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_27__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_27__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_27__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_27__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_28() {
  let capture = DebugCapture::from_name("scenario_28.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_28__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_28__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_28__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_28__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_28__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_29() {
  let capture = DebugCapture::from_name("scenario_29.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_29__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_29__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_29__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_29__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_29__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_30() {
  let capture = DebugCapture::from_name("scenario_30.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_30__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_30__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_30__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_30__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_30__results", results)
  });
}

#[tokio::main]
#[test]
async fn scenario_31() {
  let capture = DebugCapture::from_name("scenario_31.json").await;

  let spec_projection = SpecProjection::from(capture.events);
  assert_debug_snapshot!(
    "scenario_31__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_31__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_31__shape_choice_mapping",
    &spec_projection.shape().to_choice_mapping()
  );
  assert_json_snapshot!(
    "scenario_31__shape_choice_mapping_json",
    &spec_projection.shape().to_choice_mapping()
  );

  capture.session.samples.into_iter().for_each(|interaction| {
    let results = diff_interaction(
      &spec_projection,
      interaction,
      &DiffInteractionConfig::default(),
    );
    assert_debug_snapshot!("scenario_31__results", results)
  });
}

#[derive(Deserialize, Debug, Serialize)]
struct DebugCapture {
  events: Vec<SpecEvent>,
  session: DebugCaptureSession,
}

impl DebugCapture {
  fn _new(events: Vec<SpecEvent>, samples: Vec<HttpInteraction>) -> Self {
    Self {
      events,
      session: DebugCaptureSession { samples },
    }
  }

  async fn from_name(capture_name: &str) -> Self {
    let capture_path = std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/interaction-diff-use-cases")
      .join(capture_name);

    Self::from_file(capture_path).await
  }

  async fn from_file(capture_path: impl AsRef<Path>) -> Self {
    let capture_json = read_to_string(capture_path)
      .await
      .expect("should be able to read the debug capture");

    serde_json::from_str(&capture_json).expect("should be able to deserialize the debug capture")
  }

  fn _to_file(&self, capture_name: &str) {
    let capture_path = std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/interaction-diff-use-cases")
      .join(capture_name);

    let file = File::create(capture_path).unwrap();
    serde_json::to_writer_pretty(file, self).unwrap();
  }
}

#[derive(Deserialize, Debug, Serialize)]
struct DebugCaptureSession {
  samples: Vec<HttpInteraction>,
}
