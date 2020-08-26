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
  // #[serde(skip)]
  pub query: ArbitraryData,
  pub body: Body,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Response {
  status_code: u16,
  // #[serde(skip)]
  headers: ArbitraryData,
}

#[derive(Deserialize, Debug)]
pub struct Body {
  content_type: Option<String>,
  // #[serde(skip)]
  value: ArbitraryData,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ArbitraryData {
  shape_hash_v1_base64: Option<String>,
  as_json_string: Option<String>,
  as_text: Option<String>,
}

// impl Default for ArbitraryData {
//   fn default() -> Self {
//     Self {}
//   }
// }

impl Event for HttpInteraction {
  fn event_type(&self) -> &'static str {
    "HttpInteraction"
  }
}

impl HttpInteraction {
  pub fn from_json_str(json: &str) -> Result<Self, serde_json::Error> {
    serde_json::from_str(json)
  }

  pub fn from_avro() -> HttpInteractionAvroDeserializer {
    let deserializer = HttpInteractionAvroDeserializer::new(&INTERACTION_AVRO_SCHEMA)
      .expect("interaction avro schema should be valid");

    deserializer
  }
}

pub struct HttpInteractionAvroDeserializer {
  schema: avro_rs::Schema,
}

impl HttpInteractionAvroDeserializer {
  fn new(schema_str: &str) -> Result<Self, avro_rs::Error> {
    let schema = avro_rs::Schema::parse_str(schema_str)?;
    Ok(Self { schema })
  }

  pub fn reader<'a, R>(&'a mut self, source: R) -> Result<avro_rs::Reader<'a, R>, avro_rs::Error>
  where
    R: io::Read,
    R: 'a,
  {
    avro_rs::Reader::with_schema(&self.schema, source)
  }
}

const INTERACTION_AVRO_SCHEMA: &str = r#"{
  "type": "record",
  "name": "InteractionBatch",
  "namespace": "com.useoptic.types.capture",
  "fields": [
    {
      "name": "groupingIdentifiers",
      "type": {
        "type": "record",
        "name": "GroupingIdentifiers",
        "fields": [
          { "name": "agentGroupId", "type": "string" },
          { "name": "captureId", "type": "string" },
          { "name": "agentId", "type": "string" },
          { "name": "batchId", "type": "string" }
        ]
      }
    },
    {
      "name": "batchItems",
      "type": {
        "type": "array",
        "items": {
          "type": "record",
          "name": "HttpInteraction",
          "fields": [
            { "name": "uuid", "type": "string" },
            {
              "name": "request",
              "type": {
                "type": "record",
                "name": "Request",
                "fields": [
                  { "name": "host", "type": "string" },
                  { "name": "method", "type": "string" },
                  { "name": "path", "type": "string" },
                  {
                    "name": "query",
                    "type": {
                      "type": "record",
                      "name": "ArbitraryData",
                      "fields": [
                        {
                          "name": "shapeHashV1Base64",
                          "type": ["null", "string"],
                          "default": null
                        },
                        {
                          "name": "asJsonString",
                          "type": ["null", "string"],
                          "default": null
                        },
                        {
                          "name": "asText",
                          "type": ["null", "string"],
                          "default": null
                        }
                      ]
                    }
                  },
                  {
                    "name": "headers",
                    "type": {
                      "type": "record",
                      "name": "ArbitraryData",
                      "fields": [
                        {
                          "name": "shapeHashV1Base64",
                          "type": ["null", "string"],
                          "default": null
                        },
                        {
                          "name": "asJsonString",
                          "type": ["null", "string"],
                          "default": null
                        },
                        {
                          "name": "asText",
                          "type": ["null", "string"],
                          "default": null
                        }
                      ]
                    }
                  },
                  {
                    "name": "body",
                    "type": {
                      "type": "record",
                      "name": "Body",
                      "fields": [
                        { "name": "contentType", "type": ["null", "string"] },
                        {
                          "name": "value",
                          "type": {
                            "type": "record",
                            "name": "ArbitraryData",
                            "fields": [
                              {
                                "name": "shapeHashV1Base64",
                                "type": ["null", "string"],
                                "default": null
                              },
                              {
                                "name": "asJsonString",
                                "type": ["null", "string"],
                                "default": null
                              },
                              {
                                "name": "asText",
                                "type": ["null", "string"],
                                "default": null
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              "name": "response",
              "type": {
                "type": "record",
                "name": "Response",
                "fields": [
                  { "name": "statusCode", "type": "int" },
                  {
                    "name": "headers",
                    "type": {
                      "type": "record",
                      "name": "ArbitraryData",
                      "fields": [
                        {
                          "name": "shapeHashV1Base64",
                          "type": ["null", "string"],
                          "default": null
                        },
                        {
                          "name": "asJsonString",
                          "type": ["null", "string"],
                          "default": null
                        },
                        {
                          "name": "asText",
                          "type": ["null", "string"],
                          "default": null
                        }
                      ]
                    }
                  },
                  {
                    "name": "body",
                    "type": {
                      "type": "record",
                      "name": "Body",
                      "fields": [
                        {
                          "name": "contentType",
                          "type": ["null", "string"]
                        },
                        {
                          "name": "value",
                          "type": {
                            "type": "record",
                            "name": "ArbitraryData",
                            "fields": [
                              {
                                "name": "shapeHashV1Base64",
                                "type": ["null", "string"],
                                "default": null
                              },
                              {
                                "name": "asJsonString",
                                "type": ["null", "string"],
                                "default": null
                              },
                              {
                                "name": "asText",
                                "type": ["null", "string"],
                                "default": null
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            },
            {
              "name": "tags",
              "type": {
                "type": "array",
                "items": {
                  "type": "record",
                  "name": "HttpInteractionTag",
                  "fields": [
                    { "name": "name", "type": "string" },
                    { "name": "value", "type": "string" }
                  ]
                }
              }
            }
          ]
        }
      }
    }
  ]
}
"#;

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
