use super::EventLoadingError;
use crate::shapehash;
use crate::state::body::BodyDescriptor;
use avro_rs;
use base64;
use cqrs_core::Event;
use protobuf::Message;
use serde::{Deserialize, Serialize};
use serde_json;
use std::io;
use std::iter::FromIterator;

// TODO: consider whether these aren't actually Events and the Traverser not an Aggregator

#[derive(Clone, Deserialize, Serialize, Debug)]
pub struct HttpInteraction {
  pub uuid: String,
  pub request: Request,
  pub response: Response,
  pub tags: Vec<HttpInteractionTag>,
}

#[derive(Clone, Deserialize, Serialize, Debug)]
pub struct HttpInteractionTag {
  name: String,
  value: String,
}

#[derive(Clone, Deserialize, Serialize, Debug)]
pub struct Request {
  pub host: String,
  pub method: String,
  pub path: String,
  pub headers: ArbitraryData,
  // #[serde(skip)]
  pub query: ArbitraryData,
  pub body: Body,
}

#[derive(Clone, Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Response {
  pub status_code: u16,
  // #[serde(skip)]
  pub headers: ArbitraryData,
  pub body: Body,
}

#[derive(Clone, Deserialize, Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Body {
  pub content_type: Option<String>,
  // #[serde(skip)]
  pub value: ArbitraryData,
}

#[derive(Clone, Deserialize, Serialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct ArbitraryData {
  pub shape_hash_v1_base64: Option<String>,
  pub as_json_string: Option<String>,
  pub as_text: Option<String>,
}

impl From<&ArbitraryData> for Option<serde_json::value::Value> {
  fn from(data: &ArbitraryData) -> Option<serde_json::value::Value> {
    if let Some(json_string) = &data.as_json_string {
      Some(
        serde_json::from_str(json_string)
          .expect("as_json_string of ArbitraryData should always be valid json"),
      )
    } else if let Some(text) = &data.as_text {
      Some(serde_json::Value::from(text.clone()))
    } else if let Some(shape_hash) = &data.shape_hash_v1_base64 {
      let decoded_hash = base64::decode(shape_hash)
        .expect("shape_hash_v1_base64 of ArbitraryData should always be valid base64");
      let shape_descriptor: shapehash::ShapeDescriptor = Message::parse_from_bytes(&decoded_hash)
        .expect("shape hash should be validly encoded shapehash proto");
      Some(serde_json::Value::from(shape_descriptor))
    } else {
      None
    }
  }
}

impl From<&ArbitraryData> for Option<BodyDescriptor> {
  fn from(data: &ArbitraryData) -> Self {
    if let Some(shape_hash) = &data.shape_hash_v1_base64 {
      let decoded_hash = base64::decode(shape_hash)
        .expect("shape_hash_v1_base64 of ArbitraryData should always be valid base64");
      let shape_hash_descriptor: shapehash::ShapeDescriptor =
        Message::parse_from_bytes(&decoded_hash)
          .expect("shape hash should be validly encoded shapehash proto");
      Some(BodyDescriptor::from(shape_hash_descriptor))
    } else if let Some(json_string) = &data.as_json_string {
      let json: serde_json::Value = serde_json::from_str(json_string)
        .expect("as_json_string of ArbitraryData should always be valid json");
      Some(BodyDescriptor::from(json))
    } else if let Some(text) = &data.as_text {
      Some(BodyDescriptor::from(text))
    } else {
      None
    }
  }
}

impl From<shapehash::ShapeDescriptor> for serde_json::value::Value {
  fn from(mut shape_descriptor: shapehash::ShapeDescriptor) -> serde_json::value::Value {
    use serde_json::map::Map;
    use serde_json::value::Value;

    match shape_descriptor.field_type {
      shapehash::ShapeDescriptor_PrimitiveType::OBJECT => {
        let map = Map::from_iter(shape_descriptor.take_fields().into_iter().map(
          |field_descriptor| {
            (
              field_descriptor.key.clone(),
              Value::from(field_descriptor.hash.unwrap()),
            )
          },
        ));
        Value::from(map)
      }
      shapehash::ShapeDescriptor_PrimitiveType::ARRAY => Value::from_iter(
        shape_descriptor
          .take_items()
          .into_iter()
          .map(|descriptor| Value::from(descriptor)),
      ),
      shapehash::ShapeDescriptor_PrimitiveType::BOOLEAN => Value::from(true),
      shapehash::ShapeDescriptor_PrimitiveType::NUMBER => Value::from(1),
      shapehash::ShapeDescriptor_PrimitiveType::STRING => Value::from("string"),
      shapehash::ShapeDescriptor_PrimitiveType::NULL => Value::Null,
    }
  }
}

pub enum ShapeHashParsingError {
  Serde(serde_json::Error),
  Utf8(std::string::FromUtf8Error),
}

impl From<std::string::FromUtf8Error> for ShapeHashParsingError {
  fn from(err: std::string::FromUtf8Error) -> ShapeHashParsingError {
    ShapeHashParsingError::Utf8(err)
  }
}

impl From<serde_json::Error> for ShapeHashParsingError {
  fn from(err: serde_json::Error) -> ShapeHashParsingError {
    ShapeHashParsingError::Serde(err)
  }
}

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
