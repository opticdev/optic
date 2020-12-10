use futures::sink::SinkExt;
use insta::assert_debug_snapshot;
use optic_diff_engine::{diff_interaction, streams, HttpInteraction, SpecEvent, SpecProjection};
use petgraph::dot::Dot;
use serde_json::json;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::stream::StreamExt;

#[tokio::main]
#[test]
async fn can_yield_interactive_diff_result() {
  let events = SpecEvent::from_file(
    std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/ergast-example-spec.json")
      .to_str()
      .unwrap(),
  )
  .expect("todos spec should deserialize");

  let spec_projection = SpecProjection::from(events);
  {
    let endpoint_projection = spec_projection.endpoint();

    for node_index in endpoint_projection.graph.node_indices() {
      println!(
        "{:?}: {:?}",
        node_index,
        endpoint_projection.graph.node_weight(node_index).unwrap()
      )
    }
    assert_debug_snapshot!(Dot::with_config(&endpoint_projection.graph, &[]));

    assert_debug_snapshot!(Dot::with_config(&spec_projection.shape().graph, &[]));
  }

  let interaction = HttpInteraction::from_json_str(
    r#"{
    "uuid": "5",
    "request": {
      "host": "localhost",
      "method": "GET",
      "path": "/api/f1/2019/drivers/screw",
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
        "contentType": null,
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
        "contentType": "application/jsonxxx",
        "value": {}
      }
    },
    "tags": []
  }"#,
  )
  .expect("example http interaction should deserialize");
  println!("{:?}", interaction);

  let results = diff_interaction(&spec_projection, interaction);

  println!("{:?}", results);
  assert_eq!(results.len(), 1);

  assert_debug_snapshot!("can_yield_interactive_diff_result__results", results);

  let mut destination: Vec<u8> = vec![];
  assert_eq!(destination.len(), 0);
  {
    let mut sink = streams::diff::into_json_lines(&mut destination);
    for result in results {
      if let Err(_) = sink.send(result).await {
        panic!("interaction diff results should deserialise and write to json lines");
      }
    }
  }
  assert!(destination.len() > 0);

  let desitination_reader = BufReader::new(std::io::Cursor::new(&destination));
  let mut written_lines = desitination_reader.lines();
  let first_line = written_lines
    .next()
    .await
    .expect("should be able to read a line from the in-memory destination")
    .unwrap();
  serde_json::from_str::<serde_json::Value>(&first_line).expect("first line should be valid json");
}

#[test]
fn can_yield_unmatched_request_url() {
  let events: Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"PathComponentAdded":{"pathId":"path_1","parentPathId":"root","name":"xyz"}},
      {"RequestAdded":{"requestId":"request_1","pathId":"path_1","httpMethod":"POST"}},
      {"ResponseAddedByPathAndMethod":{"responseId":"response_1", "httpStatusCode":200,"pathId":"path_1","httpMethod":"GET"}},
    ])
  ).expect("should be able to deserialize path added events as spec events");

  let interaction = HttpInteraction::from_json_str(
    r#"{
    "uuid": "5",
    "request": {
      "host": "localhost",
      "method": "GET",
      "path": "/abc/def",
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
        "contentType": null,
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
        "contentType": null,
        "value": {}
      }
    },
    "tags": []
  }"#,
  )
  .expect("example http interaction should deserialize");

  let spec_projection = SpecProjection::from(events);
  let results = diff_interaction(&spec_projection, interaction);
  let fingerprints = results
    .iter()
    .map(|result| result.fingerprint())
    .collect::<Vec<_>>();

  assert_debug_snapshot!("can_yield_unmatched_request_url__results", results);
  assert_debug_snapshot!(
    "can_yield_unmatched_request_url__fingerprints",
    fingerprints
  );
  assert_eq!(results.len(), 1);
}

#[tokio::main]
#[test]
async fn can_yield_unmatched_shape() {
  let events: Vec<SpecEvent> = serde_json::from_value(
    json!([
      {"PathComponentAdded":{"pathId":"path_1","parentPathId":"root","name":"xyz"}},
      {"RequestAdded":{"requestId":"request_1","pathId":"path_1","httpMethod":"POST"}},
      {"ResponseAddedByPathAndMethod":{"responseId":"response_1", "httpStatusCode":200,"pathId":"path_1","httpMethod":"POST"}},
      {"ShapeAdded":{"shapeId":"shape_1","baseShapeId":"$string","parameters":{"DynamicParameterList":{"shapeParameterIds":[]}},"name":""}},
      {"RequestBodySet": {"shapeId":"shape_1","requestId": "request_1", "bodyDescriptor":{"httpContentType":"application/json","shapeId":"shape_1","isRemoved":false}}}
    ]),
  ).expect("should be able to deserialize shape added events as spec events");

  let spec_projection = SpecProjection::from(events);

  let compliant_interaction = HttpInteraction::from_json_str(
    r#"{
    "uuid": "5",
    "request": {
      "host": "localhost",
      "method": "POST",
      "path": "/xyz",
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
        "value": {
          "asJsonString": null,
          "asText": "whatever",
          "asShapeHashBytes": null
        }
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
        "contentType": null,
        "value": {
          "asJsonString": null,
          "asText": null,
          "asShapeHashBytes": null
        }
      }
    },
    "tags": []
  }"#,
  )
  .expect("example http interaction should deserialize");

  let mut results = diff_interaction(&spec_projection, compliant_interaction);
  assert_debug_snapshot!(results);
  assert_eq!(results.len(), 0);

  let incompliant_interaction = HttpInteraction::from_json_str(
    r#"{
    "uuid": "5",
    "request": {
      "host": "localhost",
      "method": "POST",
      "path": "/xyz",
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
        "value": {
          "asJsonString": "null",
          "asText": null,
          "asShapeHashBytes": null
        }
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
        "contentType": null,
        "value": {
          "asJsonString": null,
          "asText": null,
          "asShapeHashBytes": null
        }
      }
    },
    "tags": []
  }"#,
  )
  .expect("example http interaction should deserialize");

  results = diff_interaction(&spec_projection, incompliant_interaction);
  let fingerprints = results
    .iter()
    .map(|result| result.fingerprint())
    .collect::<Vec<_>>();
  assert_debug_snapshot!(results);
  assert_debug_snapshot!("can_yield_unmatched_shape__fingerprints", fingerprints);
}
