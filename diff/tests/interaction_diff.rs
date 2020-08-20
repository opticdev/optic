use cqrs_core::Aggregate;
use optic_diff::events::{HttpInteraction, SpecEvent};
use optic_diff::interactions::diff;
use optic_diff::projections::endpoint::EndpointProjection;

#[test]
fn can_yield_umatched_request_url() {
  let events = SpecEvent::from_file(
    std::env::current_dir()
      .unwrap()
      .join("tests/fixtures/todos-spec.json")
      .to_str()
      .unwrap(),
  )
  .expect("todos spec should deserialize");

  let mut events_projection = EndpointProjection::default();

  for event in events {
    events_projection.apply(event)
  }

  let interaction = HttpInteraction::from_json_str(
    r#"{
    "uuid": "5",
    "request": {
      "host": "localhost",
      "method": "GET",
      "path": "/todos/abcdefg",
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
  },"#,
  )
  .expect("example http interaction should deserialize");

  let results = diff(&mut events_projection, interaction);
  assert_eq!(results.len(), 1);
}
