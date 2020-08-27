use cqrs_core::Aggregate;
use futures::sink::SinkExt;
use insta::assert_debug_snapshot;
use optic_diff::{diff_interaction, streams, EndpointProjection, HttpInteraction, SpecEvent};
use petgraph::dot::{Config, Dot};

#[tokio::test]
async fn can_yield_umatched_request_url() {
  let events = SpecEvent::from_file(
    std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/ergast-example-spec.json")
      .to_str()
      .unwrap(),
  )
  .expect("todos spec should deserialize");

  let mut events_projection = EndpointProjection::default();

  for event in events {
    events_projection.apply(event)
  }
  for node_index in events_projection.graph.node_indices() {
    println!(
      "{:?}: {:?}",
      node_index,
      events_projection.graph.node_weight(node_index).unwrap()
    )
  }
  assert_debug_snapshot!(Dot::with_config(
    &events_projection.graph,
    &[Config::EdgeNoLabel]
  ));

  let interaction = HttpInteraction::from_json_str(
    r#"{
    "uuid": "5",
    "request": {
      "host": "localhost",
      "method": "GET",
      "path": "/api/f1/2019/drivers/screw/BAD",
      "query": {
        "asJsonString": null,
        "asText": null,
        "asShapeHashBytes": null
      },
      "headers": {
        "asJsonString": null,
        "asText": null,
        "asShapeHashBytes": null
      },
      "body": {
        "contentType": "application/json",
        "value": {}
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "asJsonString": null,
        "asText": null,
        "asShapeHashBytes": null
      },
      "body": {
        "contentType": "application/json",
        "value": {}
      }
    },
    "tags": []
  }"#,
  )
  .expect("example http interaction should deserialize");

  let results = diff_interaction(&mut events_projection, interaction);
  assert_eq!(results.len(), 1);

  let mut destination: Vec<u8> = vec![];
  assert_eq!(destination.len(), 0);
  {
    let mut sink = streams::diff::into_json_lines(&mut destination);
    for result in results {
      sink.send(result).await;
    }
  }
  assert!(destination.len() > 0); // TODO: try to parse this as a stream of json
}
