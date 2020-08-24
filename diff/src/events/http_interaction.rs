use super::EventLoadingError;
use avro_rs;
use cqrs_core::Event;
use serde::Deserialize;
use serde_json;
use std::io;

// TODO: consider whether these aren't actually Events and the Traverser not an Aggregator

#[derive(Deserialize, Debug)]
pub struct HttpInteraction {
  pub uuid: String,
  pub request: Request,
  pub response: Response,
  pub tags: Vec<HttpInteractionTag>,
}

#[derive(Deserialize, Debug)]
pub struct HttpInteractionTag {
  name: String,
  value: String,
}

#[derive(Deserialize, Debug)]
pub struct Request {
  pub host: String,
  pub method: String,
  pub path: String,
  pub query: ArbitraryData,
  pub body: Body,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Response {
  status_code: u16,
  headers: ArbitraryData,
}

#[derive(Deserialize, Debug)]
pub struct Body {
  content_type: Option<String>,
  value: ArbitraryData,
}

#[derive(Deserialize, Debug)]
pub struct ArbitraryData {}

impl Event for HttpInteraction {
  fn event_type(&self) -> &'static str {
    "HttpInteraction"
  }
}

impl HttpInteraction {
  pub fn from_json_str(json: &str) -> Result<Self, serde_json::Error> {
    serde_json::from_str(json)
  }

  pub fn from_avro<R>(source: R) -> Result<impl Iterator<Item = Self>, EventLoadingError>
  where
    R: io::Read,
  {
    let reader = avro_rs::Reader::new(source)?;

    let interactions = reader.map(|value| avro_rs::from_value(&value.unwrap()).unwrap());

    Ok(interactions)
  }
}

#[cfg(test)]
mod test {
  use super::*;
  #[test]
  fn can_deserialize_interaction_from_json_str() {
    let json = r#"{
      "uuid": "3",
      "request": {
        "host": "localhost",
        "method": "GET",
        "path": "/todos",
        "query": {},
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
          "contentType": "application/json",
          "value": {}
        }
      },
      "tags": []
    }"#;

    let interaction = HttpInteraction::from_json_str(&json);
    interaction.expect("Valid JSON should be able to deserialize into an HttpInteraction");
  }
}
