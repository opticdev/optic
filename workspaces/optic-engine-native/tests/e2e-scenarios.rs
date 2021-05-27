#![recursion_limit = "2560"]
use insta::assert_debug_snapshot;
use insta::assert_json_snapshot;
use optic_engine::{diff_interaction, HttpInteraction, SpecEvent, SpecProjection};
use petgraph::dot::Dot;
use serde_json::json;

#[test]
fn scenario_1() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "locations",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":city",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_8",
        "name": "city",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_5",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_5",
        "name": "lat",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_5",
        "name": "long",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$optional",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_8",
        "name": "coordinates",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_8",
        "name": "population",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_9",
        "name": "principality",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_7",
        "shapeId": "shape_10",
        "name": "location",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_7",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_6",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_5"
              }
            },
            "consumingParameterId": "$optionalInner"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/locations/sf",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EkkKCGxvY2F0aW9uEj0SOwoMcHJpbmNpcGFsaXR5EisSCwoFbW90dG8SAggCEgoKBGNpdHkSAggCEhAKCnBvcHVsYXRpb24SAggD",
          "asJsonString": "{\"location\":{\"principality\":{\"motto\":\"Experientia Docet\",\"city\":\"San Fransisco\",\"population\":830000}}}",
          "asText": "{\"location\":{\"principality\":{\"motto\":\"Experientia Docet\",\"city\":\"San Fransisco\",\"population\":830000}}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_1__results", results)
  });
}

#[test]
fn scenario_2() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "people",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_14",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_14",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_12",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_12",
        "name": "colors",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_10"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_12",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_11"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_13",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_10",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_9"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_13",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_12"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_13",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/people",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "CAEaMRIKCgRuYW1lEgIIAhIJCgNhZ2USAggCEhgKBmNvbG9ycxIOCAEaAggCGgIIAhoCCAI=",
          "asJsonString": "[{\"name\":\"joe\",\"age\":\"thirty\",\"colors\":[\"red\",\"green\",\"yellow\"]}]",
          "asText": "[{\"name\":\"joe\",\"age\":\"thirty\",\"colors\":[\"red\",\"green\",\"yellow\"]}]"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_2__results", results)
  });
}

#[test]
fn scenario_3() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "events",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_4",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$unknown",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_3",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_2"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_3",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> = serde_json::from_value(json!([
    {
      "uuid": "id",
      "request": {
        "host": "example.com",
        "method": "GET",
        "path": "/events",
        "query": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": null,
          "value": {
            "shapeHashV1Base64": null,
            "asJsonString": null,
            "asText": null
          }
        }
      },
      "response": {
        "statusCode": 200,
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": "application/json",
          "value": {
            "shapeHashV1Base64": "CAEaAggDGgIIAxoCCAMaAggDGgIIAw==",
            "asJsonString": "[1,2,3,4,5]",
            "asText": "[1,2,3,4,5]"
          }
        }
      },
      "tags": []
    }
  ]))
  .expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_3__results", results)
  });
}

#[test]
fn scenario_4() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "path_3",
        "parentPathId": "path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_4",
        "name": "first",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_4",
        "name": "last",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_10",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_10",
        "name": "rivals",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_9",
        "name": "rank",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_10",
        "name": "stats",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_7",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_6"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EiEKBG5hbWUSGRILCgVmaXJzdBICCAISCgoEbGFzdBICCAISGAoGcml2YWxzEg4IARoCCAIaAggCGgIIAhIJCgVzdGF0cxIA",
          "asJsonString": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[\"user1\",\"user2\",\"user3\"],\"stats\":{}}",
          "asText": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[\"user1\",\"user2\",\"user3\"],\"stats\":{}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_4__results", results)
  });
}

#[test]
fn scenario_5() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "baseline-path_2",
        "parentPathId": "baseline-path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "baseline-path_2",
        "shapeDescriptor": {
          "shapeId": "baseline-shape_9",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_3",
        "parentPathId": "baseline-path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "baseline-request-parameter_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "baseline-request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "baseline-shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "baseline-request_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "baseline-response_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_2",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_1",
        "shapeId": "baseline-shape_8",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_1",
            "shapeId": "baseline-shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_5",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_2",
        "shapeId": "baseline-shape_8",
        "name": "cities",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_2",
            "shapeId": "baseline-shape_5"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_3",
        "shapeId": "baseline-shape_8",
        "name": "firstName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_3",
            "shapeId": "baseline-shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_4",
        "shapeId": "baseline-shape_8",
        "name": "lastName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_4",
            "shapeId": "baseline-shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "baseline-shape_5",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "baseline-shape_4"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "baseline-response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "baseline-shape_8",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EgkKA2FnZRICCAMSDgoIbGFzdE5hbWUSAggCEg8KCWZpcnN0TmFtZRICCAISLAoNZmF2b3JpdGVDb2xvchIbEgsKBWZpcnN0EgIIAhIMCgZzZWNvbmQSAggCEhgKBmNpdGllcxIOCAEaAggCGgIIAhoCCAI=",
          "asJsonString": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",\"New York\",\"Durham\"],\"favoriteColor\":{\"first\":\"orange\",\"second\":\"red\"}}",
          "asText": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",\"New York\",\"Durham\"],\"favoriteColor\":{\"first\":\"orange\",\"second\":\"red\"}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_5__results", results)
  });
}

#[test]
fn scenario_6() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "people",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_14",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_14",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_12",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_12",
        "name": "colors",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_10"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_12",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_11"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_13",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_10",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_9"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_13",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_12"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_13",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/people",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "CAEaMRIKCgRuYW1lEgIIAhIJCgNhZ2USAggCEhgKBmNvbG9ycxIOCAEaAggCGgIIAhoCCAIaAggC",
          "asJsonString": "[{\"name\":\"joe\",\"age\":\"thirty\",\"colors\":[\"red\",\"green\",\"yellow\"]},\"hello\"]",
          "asText": "[{\"name\":\"joe\",\"age\":\"thirty\",\"colors\":[\"red\",\"green\",\"yellow\"]},\"hello\"]"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_6__results", results)
  });
}

#[test]
fn scenario_7() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_1",
        "parentPathId": "root",
        "name": "homes",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "baseline-request-parameter_1",
        "pathId": "baseline-path_1",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "baseline-request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "baseline-shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "baseline-request_1",
        "pathId": "baseline-path_1",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "baseline-response_1",
        "pathId": "baseline-path_1",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_5",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_3",
        "shapeId": "baseline-shape_8",
        "name": "address",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_3",
            "shapeId": "baseline-shape_5"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_6",
        "baseShapeId": "$unknown",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_7",
        "baseShapeId": "$nullable",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_4",
        "shapeId": "baseline-shape_8",
        "name": "price",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_4",
            "shapeId": "baseline-shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_9",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "baseline-shape_7",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "baseline-shape_6"
              }
            },
            "consumingParameterId": "$nullableInner"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "baseline-shape_9",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "baseline-shape_8"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "baseline-response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "baseline-shape_9",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/homes",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "CAEaHBINCgdhZGRyZXNzEgIIAhILCgVwcmljZRICCAMaHBINCgdhZGRyZXNzEgIIAhILCgVwcmljZRICCAM=",
          "asJsonString": "[{\"address\":\"123\",\"price\":657},{\"address\":\"456\",\"price\":322}]",
          "asText": "[{\"address\":\"123\",\"price\":657},{\"address\":\"456\",\"price\":322}]"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_7__results", results)
  });
}

#[test]
fn scenario_8() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "people",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_14",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_14",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_12",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_12",
        "name": "colors",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_10"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_12",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_11"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_13",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_10",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_9"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_13",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_12"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_13",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> = serde_json::from_value(json!([
    {
      "uuid": "id",
      "request": {
        "host": "example.com",
        "method": "GET",
        "path": "/people",
        "query": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": null,
          "value": {
            "shapeHashV1Base64": null,
            "asJsonString": null,
            "asText": null
          }
        }
      },
      "response": {
        "statusCode": 200,
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": "application/json",
          "value": {
            "shapeHashV1Base64": "CAEaAggB",
            "asJsonString": "[[]]",
            "asText": "[[]]"
          }
        }
      },
      "tags": []
    }
  ]))
  .expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_8__results", results)
  });
}

#[test]
fn scenario_9() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "path_3",
        "parentPathId": "path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_4",
        "name": "first",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_4",
        "name": "last",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_10",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_10",
        "name": "rivals",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_9",
        "name": "rank",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_10",
        "name": "stats",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_7",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_6"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EiEKBG5hbWUSGRILCgVmaXJzdBICCAISCgoEbGFzdBICCAISGAoGcml2YWxzEg4IARoCCAIaAggCGgIIAhILCgVzdGF0cxICCAU=",
          "asJsonString": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[\"user1\",\"user2\",\"user3\"],\"stats\":null}",
          "asText": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[\"user1\",\"user2\",\"user3\"],\"stats\":null}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_9__results", results)
  });
}

#[test]
fn scenario_10() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "locations",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":city",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_8",
        "name": "city",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_5",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_5",
        "name": "lat",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_5",
        "name": "long",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$optional",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_8",
        "name": "coordinates",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_8",
        "name": "population",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_9",
        "name": "principality",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_7",
        "shapeId": "shape_10",
        "name": "location",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_7",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_6",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_5"
              }
            },
            "consumingParameterId": "$optionalInner"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/locations/sf",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "ElsKCGxvY2F0aW9uEk8STQoMcHJpbmNpcGFsaXR5Ej0SCgoEY2l0eRICCAISEAoKcG9wdWxhdGlvbhICCAMSHQoLY29vcmRpbmF0ZXMSDggBGgIIAxoCCAMaAggD",
          "asJsonString": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"coordinates\":[1,2,3]}}}",
          "asText": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"coordinates\":[1,2,3]}}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_10__results", results)
  });
}

#[test]
fn scenario_11() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "baseline-path_2",
        "parentPathId": "baseline-path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "baseline-path_2",
        "shapeDescriptor": {
          "shapeId": "baseline-shape_9",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_3",
        "parentPathId": "baseline-path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "baseline-request-parameter_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "baseline-request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "baseline-shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "baseline-request_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "baseline-response_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_2",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_1",
        "shapeId": "baseline-shape_8",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_1",
            "shapeId": "baseline-shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_5",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_2",
        "shapeId": "baseline-shape_8",
        "name": "cities",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_2",
            "shapeId": "baseline-shape_5"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_3",
        "shapeId": "baseline-shape_8",
        "name": "firstName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_3",
            "shapeId": "baseline-shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_4",
        "shapeId": "baseline-shape_8",
        "name": "lastName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_4",
            "shapeId": "baseline-shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "baseline-shape_5",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "baseline-shape_4"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "baseline-response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "baseline-shape_8",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "Eg8KCWZpcnN0TmFtZRICCAISDgoIbGFzdE5hbWUSAggCEgkKA2FnZRICCAMSGAoGY2l0aWVzEg4IARoCCAIaAggDGgIIAg==",
          "asJsonString": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",17584,\"Boston\"]}",
          "asText": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",17584,\"Boston\"]}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_11__results", results)
  });
}

#[test]
fn scenario_12() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "people",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_14",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_14",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_12",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_12",
        "name": "colors",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_10"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_12",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_11"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_13",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_10",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_9"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_13",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_12"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_13",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> = serde_json::from_value(json!([
    {
      "uuid": "id",
      "request": {
        "host": "example.com",
        "method": "GET",
        "path": "/people",
        "query": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": null,
          "value": {
            "shapeHashV1Base64": null,
            "asJsonString": null,
            "asText": null
          }
        }
      },
      "response": {
        "statusCode": 200,
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": "application/json",
          "value": {
            "shapeHashV1Base64": "CAEaDggBGgIIAxoCCAMaAggD",
            "asJsonString": "[[1,2,3]]",
            "asText": "[[1,2,3]]"
          }
        }
      },
      "tags": []
    }
  ]))
  .expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_12__results", results)
  });
}

#[test]
fn scenario_13() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "path_3",
        "parentPathId": "path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_4",
        "name": "first",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_4",
        "name": "last",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_10",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_10",
        "name": "rivals",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_9",
        "name": "rank",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_10",
        "name": "stats",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_7",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_6"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EiEKBG5hbWUSGRILCgVmaXJzdBICCAISCgoEbGFzdBICCAISNgoGcml2YWxzEiwIARoMEgoKBGZvb2QSAggCGgwSCgoEZm9vZBICCAIaDBIKCgRmb29kEgIIAhIVCgVzdGF0cxIMEgoKBHJhbmsSAggD",
          "asJsonString": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[{\"food\":\"rice\"},{\"food\":\"cookies\"},{\"food\":\"chips\"}],\"stats\":{\"rank\":1}}",
          "asText": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[{\"food\":\"rice\"},{\"food\":\"cookies\"},{\"food\":\"chips\"}],\"stats\":{\"rank\":1}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_13__results", results)
  });
}

#[test]
fn scenario_14() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "events",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_4",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$unknown",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_3",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_2"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_3",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> = serde_json::from_value(json!([
    {
      "uuid": "id",
      "request": {
        "host": "example.com",
        "method": "GET",
        "path": "/events",
        "query": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": null,
          "value": {
            "shapeHashV1Base64": null,
            "asJsonString": null,
            "asText": null
          }
        }
      },
      "response": {
        "statusCode": 200,
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": "application/json",
          "value": {
            "shapeHashV1Base64": "CAE=",
            "asJsonString": "[]",
            "asText": "[]"
          }
        }
      },
      "tags": []
    }
  ]))
  .expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_14__results", results)
  });
}

#[test]
fn scenario_15() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "baseline-path_2",
        "parentPathId": "baseline-path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "baseline-path_2",
        "shapeDescriptor": {
          "shapeId": "baseline-shape_9",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_3",
        "parentPathId": "baseline-path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "baseline-request-parameter_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "baseline-request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "baseline-shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "baseline-request_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "baseline-response_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_2",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_1",
        "shapeId": "baseline-shape_8",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_1",
            "shapeId": "baseline-shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_5",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_2",
        "shapeId": "baseline-shape_8",
        "name": "cities",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_2",
            "shapeId": "baseline-shape_5"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_3",
        "shapeId": "baseline-shape_8",
        "name": "firstName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_3",
            "shapeId": "baseline-shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_4",
        "shapeId": "baseline-shape_8",
        "name": "lastName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_4",
            "shapeId": "baseline-shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "baseline-shape_5",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "baseline-shape_4"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "baseline-response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "baseline-shape_8",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "Eg8KCWZpcnN0TmFtZRICCAISDgoIbGFzdE5hbWUSAggCEgkKA2FnZRICCAMSIAoGY2l0aWVzEhYIARoCCAIaAggDGgIIAhoCCAMaAggC",
          "asJsonString": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",17584,\"Boston\",16573,\"Chicago\"]}",
          "asText": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",17584,\"Boston\",16573,\"Chicago\"]}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_15__results", results)
  });
}

#[test]
fn scenario_16() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "path_3",
        "parentPathId": "path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_4",
        "name": "first",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_4",
        "name": "last",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_10",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_10",
        "name": "rivals",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_9",
        "name": "rank",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_10",
        "name": "stats",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_7",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_6"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EiEKBG5hbWUSGRILCgVmaXJzdBICCAISCgoEbGFzdBICCAISGAoGcml2YWxzEg4IARoCCAIaAggCGgIIAg==",
          "asJsonString": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[\"user1\",\"user2\",\"user3\"]}",
          "asText": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[\"user1\",\"user2\",\"user3\"]}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_16__results", results)
  });
}

#[test]
fn scenario_17() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "path_3",
        "parentPathId": "path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_4",
        "name": "first",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_4",
        "name": "last",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_10",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_10",
        "name": "rivals",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_9",
        "name": "rank",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_10",
        "name": "stats",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_7",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_6"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EiEKBG5hbWUSGRILCgVmaXJzdBICCAISCgoEbGFzdBICCAISGAoGcml2YWxzEg4IARoCCAIaAggCGgIIAhITCgVzdGF0cxIKCAEaAggDGgIIAw==",
          "asJsonString": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[\"user1\",\"user2\",\"user3\"],\"stats\":[12,34]}",
          "asText": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[\"user1\",\"user2\",\"user3\"],\"stats\":[12,34]}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_17__results", results)
  });
}

#[test]
fn scenario_18() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "baseline-path_2",
        "parentPathId": "baseline-path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "baseline-path_2",
        "shapeDescriptor": {
          "shapeId": "baseline-shape_9",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_3",
        "parentPathId": "baseline-path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "baseline-request-parameter_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "baseline-request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "baseline-shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "baseline-request_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "baseline-response_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_2",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_1",
        "shapeId": "baseline-shape_8",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_1",
            "shapeId": "baseline-shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_5",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_2",
        "shapeId": "baseline-shape_8",
        "name": "cities",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_2",
            "shapeId": "baseline-shape_5"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_3",
        "shapeId": "baseline-shape_8",
        "name": "firstName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_3",
            "shapeId": "baseline-shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_4",
        "shapeId": "baseline-shape_8",
        "name": "lastName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_4",
            "shapeId": "baseline-shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "baseline-shape_5",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "baseline-shape_4"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "baseline-response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "baseline-shape_8",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "Eg4KCGxhc3ROYW1lEgIIAhIJCgNhZ2USAggDEhgKBmNpdGllcxIOCAEaAggCGgIIAhoCCAI=",
          "asJsonString": "{\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",\"New York\",\"Durham\"]}",
          "asText": "{\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",\"New York\",\"Durham\"]}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_18__results", results)
  });
}

#[test]
fn scenario_19() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "events",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_4",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$unknown",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_3",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_2"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_3",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> = serde_json::from_value(json!([
    {
      "uuid": "id",
      "request": {
        "host": "example.com",
        "method": "GET",
        "path": "/events",
        "query": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": null,
          "value": {
            "shapeHashV1Base64": null,
            "asJsonString": null,
            "asText": null
          }
        }
      },
      "response": {
        "statusCode": 200,
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": "application/json",
          "value": {
            "shapeHashV1Base64": "EgkKA2ZvbxICCAI=",
            "asJsonString": "{\"foo\":\"bar\"}",
            "asText": "{\"foo\":\"bar\"}"
          }
        }
      },
      "tags": []
    }
  ]))
  .expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_19__results", results)
  });
}

#[test]
fn scenario_20() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "path_3",
        "parentPathId": "path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_4",
        "name": "first",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_4",
        "name": "last",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_10",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_10",
        "name": "rivals",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_9",
        "name": "rank",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_10",
        "name": "stats",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_7",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_6"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EiEKBG5hbWUSGRILCgVmaXJzdBICCAISCgoEbGFzdBICCAISDAoGcml2YWxzEgIIARIVCgVzdGF0cxIMEgoKBHJhbmsSAggD",
          "asJsonString": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[],\"stats\":{\"rank\":1}}",
          "asText": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":[],\"stats\":{\"rank\":1}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_20__results", results)
  });
}

#[test]
fn scenario_21() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "baseline-path_2",
        "parentPathId": "baseline-path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "baseline-path_2",
        "shapeDescriptor": {
          "shapeId": "baseline-shape_9",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_3",
        "parentPathId": "baseline-path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "baseline-request-parameter_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "baseline-request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "baseline-shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "baseline-request_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "baseline-response_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_2",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_1",
        "shapeId": "baseline-shape_8",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_1",
            "shapeId": "baseline-shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_5",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_2",
        "shapeId": "baseline-shape_8",
        "name": "cities",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_2",
            "shapeId": "baseline-shape_5"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_3",
        "shapeId": "baseline-shape_8",
        "name": "firstName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_3",
            "shapeId": "baseline-shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_4",
        "shapeId": "baseline-shape_8",
        "name": "lastName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_4",
            "shapeId": "baseline-shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "baseline-shape_5",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "baseline-shape_4"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "baseline-response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "baseline-shape_8",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "Eg8KCWZpcnN0TmFtZRICCAISDgoIbGFzdE5hbWUSAggCEgkKA2FnZRICCAISGAoGY2l0aWVzEg4IARoCCAIaAggCGgIIAg==",
          "asJsonString": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":\"not a number\",\"cities\":[\"San Fransisco\",\"New York\",\"Durham\"]}",
          "asText": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":\"not a number\",\"cities\":[\"San Fransisco\",\"New York\",\"Durham\"]}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_21__results", results)
  });
}

#[test]
fn scenario_22() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "baseline-path_2",
        "parentPathId": "baseline-path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "baseline-path_2",
        "shapeDescriptor": {
          "shapeId": "baseline-shape_9",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_3",
        "parentPathId": "baseline-path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "baseline-request-parameter_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "baseline-request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "baseline-shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "baseline-request_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "baseline-response_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_2",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_1",
        "shapeId": "baseline-shape_8",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_1",
            "shapeId": "baseline-shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_5",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_2",
        "shapeId": "baseline-shape_8",
        "name": "cities",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_2",
            "shapeId": "baseline-shape_5"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_3",
        "shapeId": "baseline-shape_8",
        "name": "firstName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_3",
            "shapeId": "baseline-shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_4",
        "shapeId": "baseline-shape_8",
        "name": "lastName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_4",
            "shapeId": "baseline-shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "baseline-shape_5",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "baseline-shape_4"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "baseline-response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "baseline-shape_8",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EgkKA2FnZRICCAMSDgoIbGFzdE5hbWUSAggCEg8KCWZpcnN0TmFtZRICCAISEwoNZmF2b3JpdGVDb2xvchICCAISGAoGY2l0aWVzEg4IARoCCAIaAggCGgIIAg==",
          "asJsonString": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",\"New York\",\"Durham\"],\"favoriteColor\":\"Syracuse-Orange\"}",
          "asText": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",\"New York\",\"Durham\"],\"favoriteColor\":\"Syracuse-Orange\"}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_22__results", results)
  });
}

#[test]
fn scenario_23() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "locations",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":city",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_8",
        "name": "city",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_5",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_5",
        "name": "lat",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_5",
        "name": "long",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$optional",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_8",
        "name": "coordinates",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_8",
        "name": "population",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_9",
        "name": "principality",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_7",
        "shapeId": "shape_10",
        "name": "location",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_7",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_6",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_5"
              }
            },
            "consumingParameterId": "$optionalInner"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/locations/sf",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "Ek8KCGxvY2F0aW9uEkMSQQoMcHJpbmNpcGFsaXR5EjESCgoEY2l0eRICCAISEAoKcG9wdWxhdGlvbhICCAMSEQoLY29vcmRpbmF0ZXMSAggC",
          "asJsonString": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"coordinates\":\"N/A\"}}}",
          "asText": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"coordinates\":\"N/A\"}}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_23__results", results)
  });
}

#[test]
fn scenario_24() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "locations",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":city",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_8",
        "name": "city",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_5",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_5",
        "name": "lat",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_5",
        "name": "long",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$optional",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_8",
        "name": "coordinates",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_8",
        "name": "population",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_9",
        "name": "principality",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_7",
        "shapeId": "shape_10",
        "name": "location",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_7",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_6",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_5"
              }
            },
            "consumingParameterId": "$optionalInner"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/locations/sf",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EnIKCGxvY2F0aW9uEmYSZAoMcHJpbmNpcGFsaXR5ElQSCgoEY2l0eRICCAISEAoKcG9wdWxhdGlvbhICCAMSNAoLY29vcmRpbmF0ZXMSJRIMCgZmb3JtYXQSAggCEgkKA2xhdBICCAISCgoEbG9uZxICCAI=",
          "asJsonString": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"coordinates\":{\"format\":\"DMS\",\"lat\":\"37.7749° N\",\"long\":\"122.4194° W\"}}}}",
          "asText": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"coordinates\":{\"format\":\"DMS\",\"lat\":\"37.7749° N\",\"long\":\"122.4194° W\"}}}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_24__results", results)
  });
}

#[test]
fn scenario_25() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "locations",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":city",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_8",
        "name": "city",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_5",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_5",
        "name": "lat",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_5",
        "name": "long",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$optional",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_8",
        "name": "coordinates",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_8",
        "name": "population",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_9",
        "name": "principality",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_7",
        "shapeId": "shape_10",
        "name": "location",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_7",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_6",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_5"
              }
            },
            "consumingParameterId": "$optionalInner"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/locations/sf",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "ElUKCGxvY2F0aW9uEkkSRwoMcHJpbmNpcGFsaXR5EjcSCgoEY2l0eRICCAISEAoKcG9wdWxhdGlvbhICCAMSFwoFYXJyYXkSDggBGgIIAxoCCAMaAggD",
          "asJsonString": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"array\":[1,2,3]}}}",
          "asText": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"array\":[1,2,3]}}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_25__results", results)
  });
}

#[test]
fn scenario_26() {
  let events: Vec<SpecEvent> =
      serde_json::from_value(json!([
  {
    "PathComponentAdded": {
      "pathId": "path_blfLlMamQG",
      "parentPathId": "root",
      "name": "api",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "835c0976-a933-4fab-bc7a-3c25dd6f6de5",
        "createdAt": "2020-07-09T15:53:40.907Z"
      }
    }
  },
  {
    "PathComponentAdded": {
      "pathId": "path_eVx6Ev3iEI",
      "parentPathId": "path_blfLlMamQG",
      "name": "f1",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "835c0976-a933-4fab-bc7a-3c25dd6f6de5",
        "createdAt": "2020-07-09T15:53:40.911Z"
      }
    }
  },
  {
    "PathParameterAdded": {
      "pathId": "path_RQwRDUB18T",
      "parentPathId": "path_eVx6Ev3iEI",
      "name": "year",
      "eventContext": null
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_ZUQJjxZZWk",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": null
    }
  },
  {
    "PathParameterShapeSet": {
      "pathId": "path_RQwRDUB18T",
      "shapeDescriptor": {
        "shapeId": "shape_ZUQJjxZZWk",
        "isRemoved": false
      },
      "eventContext": null
    }
  },
  {
    "PathComponentAdded": {
      "pathId": "path_SCQeRkSjzD",
      "parentPathId": "path_RQwRDUB18T",
      "name": "drivers",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "835c0976-a933-4fab-bc7a-3c25dd6f6de5",
        "createdAt": "2020-07-09T15:53:40.913Z"
      }
    }
  },
  {
    "PathParameterAdded": {
      "pathId": "path_M2iaqo5M9p",
      "parentPathId": "path_SCQeRkSjzD",
      "name": "driver",
      "eventContext": null
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_gHBFqqy32v",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": null
    }
  },
  {
    "PathParameterShapeSet": {
      "pathId": "path_M2iaqo5M9p",
      "shapeDescriptor": {
        "shapeId": "shape_gHBFqqy32v",
        "isRemoved": false
      },
      "eventContext": null
    }
  },
  {
    "PathComponentAdded": {
      "pathId": "path_SYRwhqD1XN",
      "parentPathId": "path_M2iaqo5M9p",
      "name": "results",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "835c0976-a933-4fab-bc7a-3c25dd6f6de5",
        "createdAt": "2020-07-09T15:53:40.913Z"
      }
    }
  },
  {
    "ContributionAdded": {
      "id": "path_SYRwhqD1XN.GET",
      "key": "purpose",
      "value": "Get results by driver and year",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "835c0976-a933-4fab-bc7a-3c25dd6f6de5",
        "createdAt": "2020-07-09T15:53:40.914Z"
      }
    }
  },
  {
    "BatchCommitStarted": {
      "batchId": "eb323d68-2557-40f9-8926-dc531f6d57e7",
      "commitMessage": "\n\nChanges:\n- Added Request with No Body\n- Added 200 Response with application/json Body",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "505fcd20-91fb-4eea-bf83-d8946a9214b2",
        "createdAt": "2020-07-09T15:53:57.022Z"
      }
    }
  },
  {
    "RequestParameterAddedByPathAndMethod": {
      "parameterId": "request-parameter_DyB9hd4S3R",
      "pathId": "path_SYRwhqD1XN",
      "httpMethod": "GET",
      "parameterLocation": "query",
      "name": "queryString",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "ddc3761c-1d4a-473e-8e7e-29474da4ddf9",
        "createdAt": "2020-07-09T15:53:57.023Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_4gwDxcPIcD",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "ddc3761c-1d4a-473e-8e7e-29474da4ddf9",
        "createdAt": "2020-07-09T15:53:57.023Z"
      }
    }
  },
  {
    "RequestParameterShapeSet": {
      "parameterId": "request-parameter_DyB9hd4S3R",
      "parameterDescriptor": {
        "shapeId": "shape_4gwDxcPIcD",
        "isRemoved": false
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "ddc3761c-1d4a-473e-8e7e-29474da4ddf9",
        "createdAt": "2020-07-09T15:53:57.023Z"
      }
    }
  },
  {
    "RequestAdded": {
      "requestId": "request_6aJsM8n6C7",
      "pathId": "path_SYRwhqD1XN",
      "httpMethod": "GET",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "ddc3761c-1d4a-473e-8e7e-29474da4ddf9",
        "createdAt": "2020-07-09T15:53:57.023Z"
      }
    }
  },
  {
    "ResponseAddedByPathAndMethod": {
      "responseId": "response_KBRwJqndED",
      "pathId": "path_SYRwhqD1XN",
      "httpMethod": "GET",
      "httpStatusCode": 200,
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.023Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_GMtxDoA6QP",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.023Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_1K7h84XwT6",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.023Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_HBb7JQz6nd",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.023Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_1VbLLR6vHi",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.023Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_SjcBKS9X84",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.024Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_mJS8YvoM93",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.024Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_dHCx3UqvZy",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.024Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_rmmGg6vaf7",
      "shapeId": "shape_mJS8YvoM93",
      "name": "country",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_rmmGg6vaf7",
          "shapeId": "shape_dHCx3UqvZy"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.024Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_iTjHeinxZf",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.024Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_npavLXSDbj",
      "shapeId": "shape_mJS8YvoM93",
      "name": "lat",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_npavLXSDbj",
          "shapeId": "shape_iTjHeinxZf"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.024Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_cnvPSZhe85",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.024Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_f7TctEJF0J",
      "shapeId": "shape_mJS8YvoM93",
      "name": "locality",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_f7TctEJF0J",
          "shapeId": "shape_cnvPSZhe85"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.024Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_6PiVFtClLo",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.024Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_bucD5E3tTS",
      "shapeId": "shape_mJS8YvoM93",
      "name": "long",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_bucD5E3tTS",
          "shapeId": "shape_6PiVFtClLo"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.025Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_qFQP5yfXhW",
      "shapeId": "shape_SjcBKS9X84",
      "name": "Location",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_qFQP5yfXhW",
          "shapeId": "shape_mJS8YvoM93"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.025Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_K6Xw9fkWDL",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.025Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_ptSwJsy7tI",
      "shapeId": "shape_SjcBKS9X84",
      "name": "circuitId",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_ptSwJsy7tI",
          "shapeId": "shape_K6Xw9fkWDL"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.025Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_TErEvQDRaw",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.025Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_uvJluUP3ut",
      "shapeId": "shape_SjcBKS9X84",
      "name": "circuitName",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_uvJluUP3ut",
          "shapeId": "shape_TErEvQDRaw"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.025Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_wlrayc7Z9k",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.025Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_dw1hKLcEMo",
      "shapeId": "shape_SjcBKS9X84",
      "name": "url",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_dw1hKLcEMo",
          "shapeId": "shape_wlrayc7Z9k"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.025Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_s68MXfY4fa",
      "shapeId": "shape_1VbLLR6vHi",
      "name": "Circuit",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_s68MXfY4fa",
          "shapeId": "shape_SjcBKS9X84"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.025Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_XA5M5sp7FW",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.025Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_KS7FqcnW2A",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.026Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_kaSMMlXLVr",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.026Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_s6VsXMW0us",
      "shapeId": "shape_KS7FqcnW2A",
      "name": "constructorId",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_s6VsXMW0us",
          "shapeId": "shape_kaSMMlXLVr"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.026Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_1j3n4HJX9Q",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.026Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_GSf561xjeR",
      "shapeId": "shape_KS7FqcnW2A",
      "name": "name",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_GSf561xjeR",
          "shapeId": "shape_1j3n4HJX9Q"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.026Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_Y8rkTAcuZE",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.026Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_rUJm7Tpubm",
      "shapeId": "shape_KS7FqcnW2A",
      "name": "nationality",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_rUJm7Tpubm",
          "shapeId": "shape_Y8rkTAcuZE"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.026Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_oHbu87Sp9N",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.026Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_TkpOoAcXqQ",
      "shapeId": "shape_KS7FqcnW2A",
      "name": "url",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_TkpOoAcXqQ",
          "shapeId": "shape_oHbu87Sp9N"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.026Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_oD4xnLYdGS",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "Constructor",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_oD4xnLYdGS",
          "shapeId": "shape_KS7FqcnW2A"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.027Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_Q1vmb3Yk2o",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.027Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_hWdV0MH64c",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.027Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_9SnD9jv8Tl",
      "shapeId": "shape_Q1vmb3Yk2o",
      "name": "code",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_9SnD9jv8Tl",
          "shapeId": "shape_hWdV0MH64c"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.027Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_O0T6r1aNzJ",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.027Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_IlsI9NRyiz",
      "shapeId": "shape_Q1vmb3Yk2o",
      "name": "dateOfBirth",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_IlsI9NRyiz",
          "shapeId": "shape_O0T6r1aNzJ"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.027Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_HA1BOdtyPQ",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.027Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_7J5ypaUHV9",
      "shapeId": "shape_Q1vmb3Yk2o",
      "name": "driverId",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_7J5ypaUHV9",
          "shapeId": "shape_HA1BOdtyPQ"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.027Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_hqbqzPsf3k",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.027Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_9snl3gNh4X",
      "shapeId": "shape_Q1vmb3Yk2o",
      "name": "familyName",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_9snl3gNh4X",
          "shapeId": "shape_hqbqzPsf3k"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.027Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_y7BytS15uN",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.028Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_8H0yrYYep1",
      "shapeId": "shape_Q1vmb3Yk2o",
      "name": "givenName",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_8H0yrYYep1",
          "shapeId": "shape_y7BytS15uN"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.028Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_dHPixDTUHS",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.028Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_jdFc2OsRqK",
      "shapeId": "shape_Q1vmb3Yk2o",
      "name": "nationality",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_jdFc2OsRqK",
          "shapeId": "shape_dHPixDTUHS"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.028Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_rJTgdHbZb7",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.028Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_hVjqCtul7Q",
      "shapeId": "shape_Q1vmb3Yk2o",
      "name": "permanentNumber",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_hVjqCtul7Q",
          "shapeId": "shape_rJTgdHbZb7"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.028Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_LogwGfZ6dt",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.028Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_81jKaGGrKR",
      "shapeId": "shape_Q1vmb3Yk2o",
      "name": "url",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_81jKaGGrKR",
          "shapeId": "shape_LogwGfZ6dt"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.028Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_9NjjQ8XqiC",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "Driver",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_9NjjQ8XqiC",
          "shapeId": "shape_Q1vmb3Yk2o"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.028Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_DTHG1XLMPV",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.028Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_Mz0Bk8LJx4",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_g4w0rcshvo",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_o5ULX5rah5",
      "shapeId": "shape_Mz0Bk8LJx4",
      "name": "speed",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_o5ULX5rah5",
          "shapeId": "shape_g4w0rcshvo"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_iIDIvLCcfS",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_5Zv3SxFPOU",
      "shapeId": "shape_Mz0Bk8LJx4",
      "name": "units",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_5Zv3SxFPOU",
          "shapeId": "shape_iIDIvLCcfS"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_dGAokm0W6a",
      "shapeId": "shape_DTHG1XLMPV",
      "name": "AverageSpeed",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_dGAokm0W6a",
          "shapeId": "shape_Mz0Bk8LJx4"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_Hkes6mW059",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_3Xq1EaSQkc",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_6ydB4IrZlc",
      "shapeId": "shape_Hkes6mW059",
      "name": "time",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_6ydB4IrZlc",
          "shapeId": "shape_3Xq1EaSQkc"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_aTz005ocl8",
      "shapeId": "shape_DTHG1XLMPV",
      "name": "Time",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_aTz005ocl8",
          "shapeId": "shape_Hkes6mW059"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_fzqDsTcmuM",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.029Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_1LCpA0S0dv",
      "shapeId": "shape_DTHG1XLMPV",
      "name": "lap",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_1LCpA0S0dv",
          "shapeId": "shape_fzqDsTcmuM"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.030Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_cqBVUMcF7a",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.030Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_WnKwfz5il8",
      "shapeId": "shape_DTHG1XLMPV",
      "name": "rank",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_WnKwfz5il8",
          "shapeId": "shape_cqBVUMcF7a"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.030Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_lKkPHZp1kM",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "FastestLap",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_lKkPHZp1kM",
          "shapeId": "shape_DTHG1XLMPV"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.030Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_ZaQCM40d39",
      "baseShapeId": "$object",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.030Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_5pwI4nMken",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.030Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_gOoqPkowDP",
      "shapeId": "shape_ZaQCM40d39",
      "name": "millis",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_gOoqPkowDP",
          "shapeId": "shape_5pwI4nMken"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.030Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_ixSsYcqP04",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.030Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_aI3iJKd8d8",
      "shapeId": "shape_ZaQCM40d39",
      "name": "time",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_aI3iJKd8d8",
          "shapeId": "shape_ixSsYcqP04"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.030Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_jBer8hMnm5",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "Time",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_jBer8hMnm5",
          "shapeId": "shape_ZaQCM40d39"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.030Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_M1u1THiLg5",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.031Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_EctFv7oFaj",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "grid",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_EctFv7oFaj",
          "shapeId": "shape_M1u1THiLg5"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.031Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_E3wIBYUTxz",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.031Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_H4Pl7Ds9uR",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "laps",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_H4Pl7Ds9uR",
          "shapeId": "shape_E3wIBYUTxz"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.031Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_DEfFaB2sUk",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.031Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_aCn1z3SwaT",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "number",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_aCn1z3SwaT",
          "shapeId": "shape_DEfFaB2sUk"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.031Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_txo6ZqOtpk",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.031Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_vsB4s8Pe09",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "points",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_vsB4s8Pe09",
          "shapeId": "shape_txo6ZqOtpk"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.031Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_xlbP1rucqo",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.031Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_c0MactNj2A",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "position",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_c0MactNj2A",
          "shapeId": "shape_xlbP1rucqo"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.031Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_9MGrgzPhOw",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.032Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_VuPEcyF1vf",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "positionText",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_VuPEcyF1vf",
          "shapeId": "shape_9MGrgzPhOw"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.032Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_DHB4lACdul",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.032Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_9dSuRtTTxG",
      "shapeId": "shape_XA5M5sp7FW",
      "name": "status",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_9dSuRtTTxG",
          "shapeId": "shape_DHB4lACdul"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.032Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_3qED1KRQhg",
      "baseShapeId": "$list",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.032Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_zOCRycvAZJ",
      "shapeId": "shape_1VbLLR6vHi",
      "name": "Results",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_zOCRycvAZJ",
          "shapeId": "shape_3qED1KRQhg"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.032Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_h8jdPLNKsp",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.032Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_Uh902Vk78C",
      "shapeId": "shape_1VbLLR6vHi",
      "name": "date",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_Uh902Vk78C",
          "shapeId": "shape_h8jdPLNKsp"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.032Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_qqIHC6xDVH",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.032Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_ITFL2jMB8x",
      "shapeId": "shape_1VbLLR6vHi",
      "name": "raceName",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_ITFL2jMB8x",
          "shapeId": "shape_qqIHC6xDVH"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.033Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_i61BOAwOhw",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.033Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_tHi1Gwb8Ku",
      "shapeId": "shape_1VbLLR6vHi",
      "name": "round",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_tHi1Gwb8Ku",
          "shapeId": "shape_i61BOAwOhw"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.033Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_JqT7NUslk6",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.033Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_fxqkg1XvG1",
      "shapeId": "shape_1VbLLR6vHi",
      "name": "season",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_fxqkg1XvG1",
          "shapeId": "shape_JqT7NUslk6"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.033Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_vtcch5ZDVh",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.033Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_EOHqqOsyYy",
      "shapeId": "shape_1VbLLR6vHi",
      "name": "time",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_EOHqqOsyYy",
          "shapeId": "shape_vtcch5ZDVh"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.033Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_fj2yWpRDEh",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.033Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_5vrGHyf7ZM",
      "shapeId": "shape_1VbLLR6vHi",
      "name": "url",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_5vrGHyf7ZM",
          "shapeId": "shape_fj2yWpRDEh"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.033Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_oCz30NI4Be",
      "baseShapeId": "$list",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.033Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_pwfcDq2meR",
      "shapeId": "shape_HBb7JQz6nd",
      "name": "Races",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_pwfcDq2meR",
          "shapeId": "shape_oCz30NI4Be"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.034Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_9nsoVJbTP1",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.034Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_44RBXlpcQJ",
      "shapeId": "shape_HBb7JQz6nd",
      "name": "driverId",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_44RBXlpcQJ",
          "shapeId": "shape_9nsoVJbTP1"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.034Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_Gs1LzYEfCQ",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.035Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_twka43JljA",
      "shapeId": "shape_HBb7JQz6nd",
      "name": "season",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_twka43JljA",
          "shapeId": "shape_Gs1LzYEfCQ"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.035Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_I25Vs4cAAF",
      "shapeId": "shape_1K7h84XwT6",
      "name": "RaceTable",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_I25Vs4cAAF",
          "shapeId": "shape_HBb7JQz6nd"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.036Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_0Z1KxFx3Q3",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.036Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_D2sd46FKwj",
      "shapeId": "shape_1K7h84XwT6",
      "name": "limit",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_D2sd46FKwj",
          "shapeId": "shape_0Z1KxFx3Q3"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.036Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_OsCK29Ako2",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.036Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_AJm7jNHyxN",
      "shapeId": "shape_1K7h84XwT6",
      "name": "offset",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_AJm7jNHyxN",
          "shapeId": "shape_OsCK29Ako2"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.036Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_xMMQP7RnaR",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.036Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_HHoUcbcxiY",
      "shapeId": "shape_1K7h84XwT6",
      "name": "series",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_HHoUcbcxiY",
          "shapeId": "shape_xMMQP7RnaR"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.036Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_7okUlcsfTe",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.037Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_dlVIugfUjy",
      "shapeId": "shape_1K7h84XwT6",
      "name": "total",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_dlVIugfUjy",
          "shapeId": "shape_7okUlcsfTe"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.037Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_4l2V7bUzNQ",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.037Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_bCm0zHsqCa",
      "shapeId": "shape_1K7h84XwT6",
      "name": "url",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_bCm0zHsqCa",
          "shapeId": "shape_4l2V7bUzNQ"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.037Z"
      }
    }
  },
  {
    "ShapeAdded": {
      "shapeId": "shape_7bGGTfwuUs",
      "baseShapeId": "$string",
      "parameters": {
        "DynamicParameterList": {
          "shapeParameterIds": []
        }
      },
      "name": "",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.037Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_u20HS5kyf1",
      "shapeId": "shape_1K7h84XwT6",
      "name": "xmlns",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_u20HS5kyf1",
          "shapeId": "shape_7bGGTfwuUs"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.037Z"
      }
    }
  },
  {
    "FieldAdded": {
      "fieldId": "field_AfS6EZ0kL3",
      "shapeId": "shape_GMtxDoA6QP",
      "name": "MRData",
      "shapeDescriptor": {
        "FieldShapeFromShape": {
          "fieldId": "field_AfS6EZ0kL3",
          "shapeId": "shape_1K7h84XwT6"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.037Z"
      }
    }
  },
  {
    "ShapeParameterShapeSet": {
      "shapeDescriptor": {
        "ProviderInShape": {
          "shapeId": "shape_3qED1KRQhg",
          "providerDescriptor": {
            "ShapeProvider": {
              "shapeId": "shape_XA5M5sp7FW"
            }
          },
          "consumingParameterId": "$listItem"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.037Z"
      }
    }
  },
  {
    "ShapeParameterShapeSet": {
      "shapeDescriptor": {
        "ProviderInShape": {
          "shapeId": "shape_oCz30NI4Be",
          "providerDescriptor": {
            "ShapeProvider": {
              "shapeId": "shape_1VbLLR6vHi"
            }
          },
          "consumingParameterId": "$listItem"
        }
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.038Z"
      }
    }
  },
  {
    "ResponseBodySet": {
      "responseId": "response_KBRwJqndED",
      "bodyDescriptor": {
        "httpContentType": "application/json",
        "shapeId": "shape_GMtxDoA6QP",
        "isRemoved": false
      },
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "fec66ab0-0b5a-489c-951d-d3a53490a4d0",
        "createdAt": "2020-07-09T15:53:57.038Z"
      }
    }
  },
  {
    "BatchCommitEnded": {
      "batchId": "eb323d68-2557-40f9-8926-dc531f6d57e7",
      "eventContext": {
        "clientId": "anonymous",
        "clientSessionId": "d3979d84-3d78-4133-ae11-5e7878edf593",
        "clientCommandBatchId": "1228783f-8a85-4588-ae96-0236ea5b712f",
        "createdAt": "2020-07-09T15:53:57.040Z"
      }
    }
  }
])).expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/api/f1/2019/drivers/max_verstappen/results",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "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",
          "asJsonString": "{\"MRData\":{\"xmlns\":\"http://ergast.com/mrd/1.4\",\"series\":\"f1\",\"url\":\"http://ergast.com/api/f1/2019/drivers/max_verstappen/results.json\",\"limit\":\"30\",\"offset\":\"0\",\"total\":\"21\",\"RaceTable\":{\"season\":\"2019\",\"driverId\":\"max_verstappen\",\"Races\":[{\"season\":\"2019\",\"round\":\"1\",\"url\":\"https://en.wikipedia.org/wiki/2019_Australian_Grand_Prix\",\"raceName\":\"Australian Grand Prix\",\"Circuit\":{\"circuitId\":\"albert_park\",\"url\":\"http://en.wikipedia.org/wiki/Melbourne_Grand_Prix_Circuit\",\"circuitName\":\"Albert Park Grand Prix Circuit\",\"Location\":{\"lat\":\"-37.8497\",\"long\":\"144.968\",\"locality\":\"Melbourne\",\"country\":\"Australia\"}},\"date\":\"2019-03-17\",\"time\":\"05:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"3\",\"positionText\":\"3\",\"points\":\"15\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"58\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5149845\",\"time\":\"+22.520\"},\"FastestLap\":{\"rank\":\"3\",\"lap\":\"57\",\"Time\":{\"time\":\"1:26.256\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"221.327\"}}}]},{\"season\":\"2019\",\"round\":\"2\",\"url\":\"https://en.wikipedia.org/wiki/2019_Bahrain_Grand_Prix\",\"raceName\":\"Bahrain Grand Prix\",\"Circuit\":{\"circuitId\":\"bahrain\",\"url\":\"http://en.wikipedia.org/wiki/Bahrain_International_Circuit\",\"circuitName\":\"Bahrain International Circuit\",\"Location\":{\"lat\":\"26.0325\",\"long\":\"50.5106\",\"locality\":\"Sakhir\",\"country\":\"Bahrain\"}},\"date\":\"2019-03-31\",\"time\":\"15:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"5\",\"laps\":\"57\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5667703\",\"time\":\"+6.408\"},\"FastestLap\":{\"rank\":\"9\",\"lap\":\"47\",\"Time\":{\"time\":\"1:35.311\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"204.417\"}}}]},{\"season\":\"2019\",\"round\":\"3\",\"url\":\"https://en.wikipedia.org/wiki/2019_Chinese_Grand_Prix\",\"raceName\":\"Chinese Grand Prix\",\"Circuit\":{\"circuitId\":\"shanghai\",\"url\":\"http://en.wikipedia.org/wiki/Shanghai_International_Circuit\",\"circuitName\":\"Shanghai International Circuit\",\"Location\":{\"lat\":\"31.3389\",\"long\":\"121.22\",\"locality\":\"Shanghai\",\"country\":\"China\"}},\"date\":\"2019-04-14\",\"time\":\"06:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"5\",\"laps\":\"56\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5553977\",\"time\":\"+27.627\"},\"FastestLap\":{\"rank\":\"6\",\"lap\":\"45\",\"Time\":{\"time\":\"1:36.143\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"204.108\"}}}]},{\"season\":\"2019\",\"round\":\"4\",\"url\":\"https://en.wikipedia.org/wiki/2019_Azerbaijan_Grand_Prix\",\"raceName\":\"Azerbaijan Grand Prix\",\"Circuit\":{\"circuitId\":\"BAK\",\"url\":\"http://en.wikipedia.org/wiki/Baku_City_Circuit\",\"circuitName\":\"Baku City Circuit\",\"Location\":{\"lat\":\"40.3725\",\"long\":\"49.8533\",\"locality\":\"Baku\",\"country\":\"Azerbaijan\"}},\"date\":\"2019-04-28\",\"time\":\"12:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"51\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5530435\",\"time\":\"+17.493\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"39\",\"Time\":{\"time\":\"1:44.794\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"206.221\"}}}]},{\"season\":\"2019\",\"round\":\"5\",\"url\":\"https://en.wikipedia.org/wiki/2019_Spanish_Grand_Prix\",\"raceName\":\"Spanish Grand Prix\",\"Circuit\":{\"circuitId\":\"catalunya\",\"url\":\"http://en.wikipedia.org/wiki/Circuit_de_Barcelona-Catalunya\",\"circuitName\":\"Circuit de Barcelona-Catalunya\",\"Location\":{\"lat\":\"41.57\",\"long\":\"2.26111\",\"locality\":\"Montmeló\",\"country\":\"Spain\"}},\"date\":\"2019-05-12\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"3\",\"positionText\":\"3\",\"points\":\"15\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"66\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5758122\",\"time\":\"+7.679\"},\"FastestLap\":{\"rank\":\"3\",\"lap\":\"57\",\"Time\":{\"time\":\"1:19.769\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"210.081\"}}}]},{\"season\":\"2019\",\"round\":\"6\",\"url\":\"https://en.wikipedia.org/wiki/2019_Monaco_Grand_Prix\",\"raceName\":\"Monaco Grand Prix\",\"Circuit\":{\"circuitId\":\"monaco\",\"url\":\"http://en.wikipedia.org/wiki/Circuit_de_Monaco\",\"circuitName\":\"Circuit de Monaco\",\"Location\":{\"lat\":\"43.7347\",\"long\":\"7.42056\",\"locality\":\"Monte-Carlo\",\"country\":\"Monaco\"}},\"date\":\"2019-05-26\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"3\",\"laps\":\"78\",\"status\":\"Finished\",\"Time\":{\"millis\":\"6213974\",\"time\":\"+5.537\"},\"FastestLap\":{\"rank\":\"7\",\"lap\":\"9\",\"Time\":{\"time\":\"1:16.229\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"157.593\"}}}]},{\"season\":\"2019\",\"round\":\"7\",\"url\":\"https://en.wikipedia.org/wiki/2019_Canadian_Grand_Prix\",\"raceName\":\"Canadian Grand Prix\",\"Circuit\":{\"circuitId\":\"villeneuve\",\"url\":\"http://en.wikipedia.org/wiki/Circuit_Gilles_Villeneuve\",\"circuitName\":\"Circuit Gilles Villeneuve\",\"Location\":{\"lat\":\"45.5\",\"long\":\"-73.5228\",\"locality\":\"Montreal\",\"country\":\"Canada\"}},\"date\":\"2019-06-09\",\"time\":\"18:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"5\",\"positionText\":\"5\",\"points\":\"10\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"9\",\"laps\":\"70\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5404739\",\"time\":\"+57.655\"},\"FastestLap\":{\"rank\":\"3\",\"lap\":\"67\",\"Time\":{\"time\":\"1:14.767\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"209.980\"}}}]},{\"season\":\"2019\",\"round\":\"8\",\"url\":\"https://en.wikipedia.org/wiki/2019_French_Grand_Prix\",\"raceName\":\"French Grand Prix\",\"Circuit\":{\"circuitId\":\"ricard\",\"url\":\"http://en.wikipedia.org/wiki/Paul_Ricard_Circuit\",\"circuitName\":\"Circuit Paul Ricard\",\"Location\":{\"lat\":\"43.2506\",\"long\":\"5.79167\",\"locality\":\"Le Castellet\",\"country\":\"France\"}},\"date\":\"2019-06-23\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"53\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5106103\",\"time\":\"+34.905\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"38\",\"Time\":{\"time\":\"1:34.162\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"223.351\"}}}]},{\"season\":\"2019\",\"round\":\"9\",\"url\":\"https://en.wikipedia.org/wiki/2019_Austrian_Grand_Prix\",\"raceName\":\"Austrian Grand Prix\",\"Circuit\":{\"circuitId\":\"red_bull_ring\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Ring\",\"circuitName\":\"Red Bull Ring\",\"Location\":{\"lat\":\"47.2197\",\"long\":\"14.7647\",\"locality\":\"Spielburg\",\"country\":\"Austria\"}},\"date\":\"2019-06-30\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"1\",\"positionText\":\"1\",\"points\":\"26\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"2\",\"laps\":\"71\",\"status\":\"Finished\",\"Time\":{\"millis\":\"4921822\",\"time\":\"1:22:01.822\"},\"FastestLap\":{\"rank\":\"1\",\"lap\":\"60\",\"Time\":{\"time\":\"1:07.475\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"230.378\"}}}]},{\"season\":\"2019\",\"round\":\"10\",\"url\":\"https://en.wikipedia.org/wiki/2019_British_Grand_Prix\",\"raceName\":\"British Grand Prix\",\"Circuit\":{\"circuitId\":\"silverstone\",\"url\":\"http://en.wikipedia.org/wiki/Silverstone_Circuit\",\"circuitName\":\"Silverstone Circuit\",\"Location\":{\"lat\":\"52.0786\",\"long\":\"-1.01694\",\"locality\":\"Silverstone\",\"country\":\"UK\"}},\"date\":\"2019-07-14\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"5\",\"positionText\":\"5\",\"points\":\"10\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"52\",\"status\":\"Finished\",\"Time\":{\"millis\":\"4907910\",\"time\":\"+39.458\"},\"FastestLap\":{\"rank\":\"4\",\"lap\":\"45\",\"Time\":{\"time\":\"1:29.272\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"237.561\"}}}]},{\"season\":\"2019\",\"round\":\"11\",\"url\":\"https://en.wikipedia.org/wiki/2019_German_Grand_Prix\",\"raceName\":\"German Grand Prix\",\"Circuit\":{\"circuitId\":\"hockenheimring\",\"url\":\"http://en.wikipedia.org/wiki/Hockenheimring\",\"circuitName\":\"Hockenheimring\",\"Location\":{\"lat\":\"49.3278\",\"long\":\"8.56583\",\"locality\":\"Hockenheim\",\"country\":\"Germany\"}},\"date\":\"2019-07-28\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"1\",\"positionText\":\"1\",\"points\":\"26\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"2\",\"laps\":\"64\",\"status\":\"Finished\",\"Time\":{\"millis\":\"6271275\",\"time\":\"1:44:31.275\"},\"FastestLap\":{\"rank\":\"1\",\"lap\":\"61\",\"Time\":{\"time\":\"1:16.645\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"214.839\"}}}]},{\"season\":\"2019\",\"round\":\"12\",\"url\":\"https://en.wikipedia.org/wiki/2019_Hungarian_Grand_Prix\",\"raceName\":\"Hungarian Grand Prix\",\"Circuit\":{\"circuitId\":\"hungaroring\",\"url\":\"http://en.wikipedia.org/wiki/Hungaroring\",\"circuitName\":\"Hungaroring\",\"Location\":{\"lat\":\"47.5789\",\"long\":\"19.2486\",\"locality\":\"Budapest\",\"country\":\"Hungary\"}},\"date\":\"2019-08-04\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"2\",\"positionText\":\"2\",\"points\":\"19\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"1\",\"laps\":\"70\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5721592\",\"time\":\"+17.796\"},\"FastestLap\":{\"rank\":\"1\",\"lap\":\"69\",\"Time\":{\"time\":\"1:17.103\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"204.552\"}}}]},{\"season\":\"2019\",\"round\":\"13\",\"url\":\"https://en.wikipedia.org/wiki/2019_Belgian_Grand_Prix\",\"raceName\":\"Belgian Grand Prix\",\"Circuit\":{\"circuitId\":\"spa\",\"url\":\"http://en.wikipedia.org/wiki/Circuit_de_Spa-Francorchamps\",\"circuitName\":\"Circuit de Spa-Francorchamps\",\"Location\":{\"lat\":\"50.4372\",\"long\":\"5.97139\",\"locality\":\"Spa\",\"country\":\"Belgium\"}},\"date\":\"2019-09-01\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"20\",\"positionText\":\"R\",\"points\":\"0\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"5\",\"laps\":\"0\",\"status\":\"Accident\"}]},{\"season\":\"2019\",\"round\":\"14\",\"url\":\"https://en.wikipedia.org/wiki/2019_Italian_Grand_Prix\",\"raceName\":\"Italian Grand Prix\",\"Circuit\":{\"circuitId\":\"monza\",\"url\":\"http://en.wikipedia.org/wiki/Autodromo_Nazionale_Monza\",\"circuitName\":\"Autodromo Nazionale di Monza\",\"Location\":{\"lat\":\"45.6156\",\"long\":\"9.28111\",\"locality\":\"Monza\",\"country\":\"Italy\"}},\"date\":\"2019-09-08\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"8\",\"positionText\":\"8\",\"points\":\"4\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"19\",\"laps\":\"53\",\"status\":\"Finished\",\"Time\":{\"millis\":\"4601157\",\"time\":\"+1:14.492\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"41\",\"Time\":{\"time\":\"1:23.143\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"250.830\"}}}]},{\"season\":\"2019\",\"round\":\"15\",\"url\":\"https://en.wikipedia.org/wiki/2019_Singapore_Grand_Prix\",\"raceName\":\"Singapore Grand Prix\",\"Circuit\":{\"circuitId\":\"marina_bay\",\"url\":\"http://en.wikipedia.org/wiki/Marina_Bay_Street_Circuit\",\"circuitName\":\"Marina Bay Street Circuit\",\"Location\":{\"lat\":\"1.2914\",\"long\":\"103.864\",\"locality\":\"Marina Bay\",\"country\":\"Singapore\"}},\"date\":\"2019-09-22\",\"time\":\"12:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"3\",\"positionText\":\"3\",\"points\":\"15\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"61\",\"status\":\"Finished\",\"Time\":{\"millis\":\"7117488\",\"time\":\"+3.821\"},\"FastestLap\":{\"rank\":\"8\",\"lap\":\"56\",\"Time\":{\"time\":\"1:45.176\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"173.298\"}}}]},{\"season\":\"2019\",\"round\":\"16\",\"url\":\"https://en.wikipedia.org/wiki/2019_Russian_Grand_Prix\",\"raceName\":\"Russian Grand Prix\",\"Circuit\":{\"circuitId\":\"sochi\",\"url\":\"http://en.wikipedia.org/wiki/Sochi_Autodrom\",\"circuitName\":\"Sochi Autodrom\",\"Location\":{\"lat\":\"43.4057\",\"long\":\"39.9578\",\"locality\":\"Sochi\",\"country\":\"Russia\"}},\"date\":\"2019-09-29\",\"time\":\"11:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"9\",\"laps\":\"53\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5633202\",\"time\":\"+14.210\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"47\",\"Time\":{\"time\":\"1:36.937\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"217.180\"}}}]},{\"season\":\"2019\",\"round\":\"17\",\"url\":\"https://en.wikipedia.org/wiki/2019_Japanese_Grand_Prix\",\"raceName\":\"Japanese Grand Prix\",\"Circuit\":{\"circuitId\":\"suzuka\",\"url\":\"http://en.wikipedia.org/wiki/Suzuka_Circuit\",\"circuitName\":\"Suzuka Circuit\",\"Location\":{\"lat\":\"34.8431\",\"long\":\"136.541\",\"locality\":\"Suzuka\",\"country\":\"Japan\"}},\"date\":\"2019-10-13\",\"time\":\"05:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"18\",\"positionText\":\"R\",\"points\":\"0\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"5\",\"laps\":\"14\",\"status\":\"Brakes\",\"FastestLap\":{\"rank\":\"18\",\"lap\":\"27\",\"Time\":{\"time\":\"1:35.458\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"218.998\"}}}]},{\"season\":\"2019\",\"round\":\"18\",\"url\":\"https://en.wikipedia.org/wiki/2019_Mexican_Grand_Prix\",\"raceName\":\"Mexican Grand Prix\",\"Circuit\":{\"circuitId\":\"rodriguez\",\"url\":\"http://en.wikipedia.org/wiki/Aut%C3%B3dromo_Hermanos_Rodr%C3%ADguez\",\"circuitName\":\"Autódromo Hermanos Rodríguez\",\"Location\":{\"lat\":\"19.4042\",\"long\":\"-99.0907\",\"locality\":\"Mexico City\",\"country\":\"Mexico\"}},\"date\":\"2019-10-27\",\"time\":\"19:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"6\",\"positionText\":\"6\",\"points\":\"8\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"71\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5877711\",\"time\":\"+1:08.807\"},\"FastestLap\":{\"rank\":\"11\",\"lap\":\"65\",\"Time\":{\"time\":\"1:20.406\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"192.702\"}}}]},{\"season\":\"2019\",\"round\":\"19\",\"url\":\"https://en.wikipedia.org/wiki/2019_United_States_Grand_Prix\",\"raceName\":\"United States Grand Prix\",\"Circuit\":{\"circuitId\":\"americas\",\"url\":\"http://en.wikipedia.org/wiki/Circuit_of_the_Americas\",\"circuitName\":\"Circuit of the Americas\",\"Location\":{\"lat\":\"30.1328\",\"long\":\"-97.6411\",\"locality\":\"Austin\",\"country\":\"USA\"}},\"date\":\"2019-11-03\",\"time\":\"19:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"3\",\"positionText\":\"3\",\"points\":\"15\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"3\",\"laps\":\"56\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5640655\",\"time\":\"+5.002\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"42\",\"Time\":{\"time\":\"1:38.214\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"202.077\"}}}]},{\"season\":\"2019\",\"round\":\"20\",\"url\":\"https://en.wikipedia.org/wiki/2019_Brazilian_Grand_Prix\",\"raceName\":\"Brazilian Grand Prix\",\"Circuit\":{\"circuitId\":\"interlagos\",\"url\":\"http://en.wikipedia.org/wiki/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace\",\"circuitName\":\"Autódromo José Carlos Pace\",\"Location\":{\"lat\":\"-23.7036\",\"long\":\"-46.6997\",\"locality\":\"São Paulo\",\"country\":\"Brazil\"}},\"date\":\"2019-11-17\",\"time\":\"17:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"1\",\"positionText\":\"1\",\"points\":\"25\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"1\",\"laps\":\"71\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5594678\",\"time\":\"1:33:14.678\"},\"FastestLap\":{\"rank\":\"2\",\"lap\":\"61\",\"Time\":{\"time\":\"1:10.862\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"218.909\"}}}]},{\"season\":\"2019\",\"round\":\"21\",\"url\":\"https://en.wikipedia.org/wiki/2019_Abu_Dhabi_Grand_Prix\",\"raceName\":\"Abu Dhabi Grand Prix\",\"Circuit\":{\"circuitId\":\"yas_marina\",\"url\":\"http://en.wikipedia.org/wiki/Yas_Marina_Circuit\",\"circuitName\":\"Yas Marina Circuit\",\"Location\":{\"lat\":\"24.4672\",\"long\":\"54.6031\",\"locality\":\"Abu Dhabi\",\"country\":\"UAE\"}},\"date\":\"2019-12-01\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"2\",\"positionText\":\"2\",\"points\":\"18\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"2\",\"laps\":\"55\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5662487\",\"time\":\"+16.772\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"55\",\"Time\":{\"time\":\"1:41.119\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"197.731\"}}}]}]}}}",
          "asText": "{\"MRData\":{\"xmlns\":\"http://ergast.com/mrd/1.4\",\"series\":\"f1\",\"url\":\"http://ergast.com/api/f1/2019/drivers/max_verstappen/results.json\",\"limit\":\"30\",\"offset\":\"0\",\"total\":\"21\",\"RaceTable\":{\"season\":\"2019\",\"driverId\":\"max_verstappen\",\"Races\":[{\"season\":\"2019\",\"round\":\"1\",\"url\":\"https://en.wikipedia.org/wiki/2019_Australian_Grand_Prix\",\"raceName\":\"Australian Grand Prix\",\"Circuit\":{\"circuitId\":\"albert_park\",\"url\":\"http://en.wikipedia.org/wiki/Melbourne_Grand_Prix_Circuit\",\"circuitName\":\"Albert Park Grand Prix Circuit\",\"Location\":{\"lat\":\"-37.8497\",\"long\":\"144.968\",\"locality\":\"Melbourne\",\"country\":\"Australia\"}},\"date\":\"2019-03-17\",\"time\":\"05:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"3\",\"positionText\":\"3\",\"points\":\"15\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"58\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5149845\",\"time\":\"+22.520\"},\"FastestLap\":{\"rank\":\"3\",\"lap\":\"57\",\"Time\":{\"time\":\"1:26.256\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"221.327\"}}}]},{\"season\":\"2019\",\"round\":\"2\",\"url\":\"https://en.wikipedia.org/wiki/2019_Bahrain_Grand_Prix\",\"raceName\":\"Bahrain Grand Prix\",\"Circuit\":{\"circuitId\":\"bahrain\",\"url\":\"http://en.wikipedia.org/wiki/Bahrain_International_Circuit\",\"circuitName\":\"Bahrain International Circuit\",\"Location\":{\"lat\":\"26.0325\",\"long\":\"50.5106\",\"locality\":\"Sakhir\",\"country\":\"Bahrain\"}},\"date\":\"2019-03-31\",\"time\":\"15:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"5\",\"laps\":\"57\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5667703\",\"time\":\"+6.408\"},\"FastestLap\":{\"rank\":\"9\",\"lap\":\"47\",\"Time\":{\"time\":\"1:35.311\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"204.417\"}}}]},{\"season\":\"2019\",\"round\":\"3\",\"url\":\"https://en.wikipedia.org/wiki/2019_Chinese_Grand_Prix\",\"raceName\":\"Chinese Grand Prix\",\"Circuit\":{\"circuitId\":\"shanghai\",\"url\":\"http://en.wikipedia.org/wiki/Shanghai_International_Circuit\",\"circuitName\":\"Shanghai International Circuit\",\"Location\":{\"lat\":\"31.3389\",\"long\":\"121.22\",\"locality\":\"Shanghai\",\"country\":\"China\"}},\"date\":\"2019-04-14\",\"time\":\"06:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"5\",\"laps\":\"56\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5553977\",\"time\":\"+27.627\"},\"FastestLap\":{\"rank\":\"6\",\"lap\":\"45\",\"Time\":{\"time\":\"1:36.143\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"204.108\"}}}]},{\"season\":\"2019\",\"round\":\"4\",\"url\":\"https://en.wikipedia.org/wiki/2019_Azerbaijan_Grand_Prix\",\"raceName\":\"Azerbaijan Grand Prix\",\"Circuit\":{\"circuitId\":\"BAK\",\"url\":\"http://en.wikipedia.org/wiki/Baku_City_Circuit\",\"circuitName\":\"Baku City Circuit\",\"Location\":{\"lat\":\"40.3725\",\"long\":\"49.8533\",\"locality\":\"Baku\",\"country\":\"Azerbaijan\"}},\"date\":\"2019-04-28\",\"time\":\"12:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"51\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5530435\",\"time\":\"+17.493\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"39\",\"Time\":{\"time\":\"1:44.794\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"206.221\"}}}]},{\"season\":\"2019\",\"round\":\"5\",\"url\":\"https://en.wikipedia.org/wiki/2019_Spanish_Grand_Prix\",\"raceName\":\"Spanish Grand Prix\",\"Circuit\":{\"circuitId\":\"catalunya\",\"url\":\"http://en.wikipedia.org/wiki/Circuit_de_Barcelona-Catalunya\",\"circuitName\":\"Circuit de Barcelona-Catalunya\",\"Location\":{\"lat\":\"41.57\",\"long\":\"2.26111\",\"locality\":\"Montmeló\",\"country\":\"Spain\"}},\"date\":\"2019-05-12\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"3\",\"positionText\":\"3\",\"points\":\"15\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"66\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5758122\",\"time\":\"+7.679\"},\"FastestLap\":{\"rank\":\"3\",\"lap\":\"57\",\"Time\":{\"time\":\"1:19.769\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"210.081\"}}}]},{\"season\":\"2019\",\"round\":\"6\",\"url\":\"https://en.wikipedia.org/wiki/2019_Monaco_Grand_Prix\",\"raceName\":\"Monaco Grand Prix\",\"Circuit\":{\"circuitId\":\"monaco\",\"url\":\"http://en.wikipedia.org/wiki/Circuit_de_Monaco\",\"circuitName\":\"Circuit de Monaco\",\"Location\":{\"lat\":\"43.7347\",\"long\":\"7.42056\",\"locality\":\"Monte-Carlo\",\"country\":\"Monaco\"}},\"date\":\"2019-05-26\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"3\",\"laps\":\"78\",\"status\":\"Finished\",\"Time\":{\"millis\":\"6213974\",\"time\":\"+5.537\"},\"FastestLap\":{\"rank\":\"7\",\"lap\":\"9\",\"Time\":{\"time\":\"1:16.229\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"157.593\"}}}]},{\"season\":\"2019\",\"round\":\"7\",\"url\":\"https://en.wikipedia.org/wiki/2019_Canadian_Grand_Prix\",\"raceName\":\"Canadian Grand Prix\",\"Circuit\":{\"circuitId\":\"villeneuve\",\"url\":\"http://en.wikipedia.org/wiki/Circuit_Gilles_Villeneuve\",\"circuitName\":\"Circuit Gilles Villeneuve\",\"Location\":{\"lat\":\"45.5\",\"long\":\"-73.5228\",\"locality\":\"Montreal\",\"country\":\"Canada\"}},\"date\":\"2019-06-09\",\"time\":\"18:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"5\",\"positionText\":\"5\",\"points\":\"10\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"9\",\"laps\":\"70\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5404739\",\"time\":\"+57.655\"},\"FastestLap\":{\"rank\":\"3\",\"lap\":\"67\",\"Time\":{\"time\":\"1:14.767\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"209.980\"}}}]},{\"season\":\"2019\",\"round\":\"8\",\"url\":\"https://en.wikipedia.org/wiki/2019_French_Grand_Prix\",\"raceName\":\"French Grand Prix\",\"Circuit\":{\"circuitId\":\"ricard\",\"url\":\"http://en.wikipedia.org/wiki/Paul_Ricard_Circuit\",\"circuitName\":\"Circuit Paul Ricard\",\"Location\":{\"lat\":\"43.2506\",\"long\":\"5.79167\",\"locality\":\"Le Castellet\",\"country\":\"France\"}},\"date\":\"2019-06-23\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"53\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5106103\",\"time\":\"+34.905\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"38\",\"Time\":{\"time\":\"1:34.162\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"223.351\"}}}]},{\"season\":\"2019\",\"round\":\"9\",\"url\":\"https://en.wikipedia.org/wiki/2019_Austrian_Grand_Prix\",\"raceName\":\"Austrian Grand Prix\",\"Circuit\":{\"circuitId\":\"red_bull_ring\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Ring\",\"circuitName\":\"Red Bull Ring\",\"Location\":{\"lat\":\"47.2197\",\"long\":\"14.7647\",\"locality\":\"Spielburg\",\"country\":\"Austria\"}},\"date\":\"2019-06-30\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"1\",\"positionText\":\"1\",\"points\":\"26\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"2\",\"laps\":\"71\",\"status\":\"Finished\",\"Time\":{\"millis\":\"4921822\",\"time\":\"1:22:01.822\"},\"FastestLap\":{\"rank\":\"1\",\"lap\":\"60\",\"Time\":{\"time\":\"1:07.475\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"230.378\"}}}]},{\"season\":\"2019\",\"round\":\"10\",\"url\":\"https://en.wikipedia.org/wiki/2019_British_Grand_Prix\",\"raceName\":\"British Grand Prix\",\"Circuit\":{\"circuitId\":\"silverstone\",\"url\":\"http://en.wikipedia.org/wiki/Silverstone_Circuit\",\"circuitName\":\"Silverstone Circuit\",\"Location\":{\"lat\":\"52.0786\",\"long\":\"-1.01694\",\"locality\":\"Silverstone\",\"country\":\"UK\"}},\"date\":\"2019-07-14\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"5\",\"positionText\":\"5\",\"points\":\"10\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"52\",\"status\":\"Finished\",\"Time\":{\"millis\":\"4907910\",\"time\":\"+39.458\"},\"FastestLap\":{\"rank\":\"4\",\"lap\":\"45\",\"Time\":{\"time\":\"1:29.272\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"237.561\"}}}]},{\"season\":\"2019\",\"round\":\"11\",\"url\":\"https://en.wikipedia.org/wiki/2019_German_Grand_Prix\",\"raceName\":\"German Grand Prix\",\"Circuit\":{\"circuitId\":\"hockenheimring\",\"url\":\"http://en.wikipedia.org/wiki/Hockenheimring\",\"circuitName\":\"Hockenheimring\",\"Location\":{\"lat\":\"49.3278\",\"long\":\"8.56583\",\"locality\":\"Hockenheim\",\"country\":\"Germany\"}},\"date\":\"2019-07-28\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"1\",\"positionText\":\"1\",\"points\":\"26\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"2\",\"laps\":\"64\",\"status\":\"Finished\",\"Time\":{\"millis\":\"6271275\",\"time\":\"1:44:31.275\"},\"FastestLap\":{\"rank\":\"1\",\"lap\":\"61\",\"Time\":{\"time\":\"1:16.645\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"214.839\"}}}]},{\"season\":\"2019\",\"round\":\"12\",\"url\":\"https://en.wikipedia.org/wiki/2019_Hungarian_Grand_Prix\",\"raceName\":\"Hungarian Grand Prix\",\"Circuit\":{\"circuitId\":\"hungaroring\",\"url\":\"http://en.wikipedia.org/wiki/Hungaroring\",\"circuitName\":\"Hungaroring\",\"Location\":{\"lat\":\"47.5789\",\"long\":\"19.2486\",\"locality\":\"Budapest\",\"country\":\"Hungary\"}},\"date\":\"2019-08-04\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"2\",\"positionText\":\"2\",\"points\":\"19\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"1\",\"laps\":\"70\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5721592\",\"time\":\"+17.796\"},\"FastestLap\":{\"rank\":\"1\",\"lap\":\"69\",\"Time\":{\"time\":\"1:17.103\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"204.552\"}}}]},{\"season\":\"2019\",\"round\":\"13\",\"url\":\"https://en.wikipedia.org/wiki/2019_Belgian_Grand_Prix\",\"raceName\":\"Belgian Grand Prix\",\"Circuit\":{\"circuitId\":\"spa\",\"url\":\"http://en.wikipedia.org/wiki/Circuit_de_Spa-Francorchamps\",\"circuitName\":\"Circuit de Spa-Francorchamps\",\"Location\":{\"lat\":\"50.4372\",\"long\":\"5.97139\",\"locality\":\"Spa\",\"country\":\"Belgium\"}},\"date\":\"2019-09-01\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"20\",\"positionText\":\"R\",\"points\":\"0\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"5\",\"laps\":\"0\",\"status\":\"Accident\"}]},{\"season\":\"2019\",\"round\":\"14\",\"url\":\"https://en.wikipedia.org/wiki/2019_Italian_Grand_Prix\",\"raceName\":\"Italian Grand Prix\",\"Circuit\":{\"circuitId\":\"monza\",\"url\":\"http://en.wikipedia.org/wiki/Autodromo_Nazionale_Monza\",\"circuitName\":\"Autodromo Nazionale di Monza\",\"Location\":{\"lat\":\"45.6156\",\"long\":\"9.28111\",\"locality\":\"Monza\",\"country\":\"Italy\"}},\"date\":\"2019-09-08\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"8\",\"positionText\":\"8\",\"points\":\"4\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"19\",\"laps\":\"53\",\"status\":\"Finished\",\"Time\":{\"millis\":\"4601157\",\"time\":\"+1:14.492\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"41\",\"Time\":{\"time\":\"1:23.143\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"250.830\"}}}]},{\"season\":\"2019\",\"round\":\"15\",\"url\":\"https://en.wikipedia.org/wiki/2019_Singapore_Grand_Prix\",\"raceName\":\"Singapore Grand Prix\",\"Circuit\":{\"circuitId\":\"marina_bay\",\"url\":\"http://en.wikipedia.org/wiki/Marina_Bay_Street_Circuit\",\"circuitName\":\"Marina Bay Street Circuit\",\"Location\":{\"lat\":\"1.2914\",\"long\":\"103.864\",\"locality\":\"Marina Bay\",\"country\":\"Singapore\"}},\"date\":\"2019-09-22\",\"time\":\"12:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"3\",\"positionText\":\"3\",\"points\":\"15\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"61\",\"status\":\"Finished\",\"Time\":{\"millis\":\"7117488\",\"time\":\"+3.821\"},\"FastestLap\":{\"rank\":\"8\",\"lap\":\"56\",\"Time\":{\"time\":\"1:45.176\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"173.298\"}}}]},{\"season\":\"2019\",\"round\":\"16\",\"url\":\"https://en.wikipedia.org/wiki/2019_Russian_Grand_Prix\",\"raceName\":\"Russian Grand Prix\",\"Circuit\":{\"circuitId\":\"sochi\",\"url\":\"http://en.wikipedia.org/wiki/Sochi_Autodrom\",\"circuitName\":\"Sochi Autodrom\",\"Location\":{\"lat\":\"43.4057\",\"long\":\"39.9578\",\"locality\":\"Sochi\",\"country\":\"Russia\"}},\"date\":\"2019-09-29\",\"time\":\"11:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"4\",\"positionText\":\"4\",\"points\":\"12\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"9\",\"laps\":\"53\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5633202\",\"time\":\"+14.210\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"47\",\"Time\":{\"time\":\"1:36.937\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"217.180\"}}}]},{\"season\":\"2019\",\"round\":\"17\",\"url\":\"https://en.wikipedia.org/wiki/2019_Japanese_Grand_Prix\",\"raceName\":\"Japanese Grand Prix\",\"Circuit\":{\"circuitId\":\"suzuka\",\"url\":\"http://en.wikipedia.org/wiki/Suzuka_Circuit\",\"circuitName\":\"Suzuka Circuit\",\"Location\":{\"lat\":\"34.8431\",\"long\":\"136.541\",\"locality\":\"Suzuka\",\"country\":\"Japan\"}},\"date\":\"2019-10-13\",\"time\":\"05:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"18\",\"positionText\":\"R\",\"points\":\"0\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"5\",\"laps\":\"14\",\"status\":\"Brakes\",\"FastestLap\":{\"rank\":\"18\",\"lap\":\"27\",\"Time\":{\"time\":\"1:35.458\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"218.998\"}}}]},{\"season\":\"2019\",\"round\":\"18\",\"url\":\"https://en.wikipedia.org/wiki/2019_Mexican_Grand_Prix\",\"raceName\":\"Mexican Grand Prix\",\"Circuit\":{\"circuitId\":\"rodriguez\",\"url\":\"http://en.wikipedia.org/wiki/Aut%C3%B3dromo_Hermanos_Rodr%C3%ADguez\",\"circuitName\":\"Autódromo Hermanos Rodríguez\",\"Location\":{\"lat\":\"19.4042\",\"long\":\"-99.0907\",\"locality\":\"Mexico City\",\"country\":\"Mexico\"}},\"date\":\"2019-10-27\",\"time\":\"19:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"6\",\"positionText\":\"6\",\"points\":\"8\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"4\",\"laps\":\"71\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5877711\",\"time\":\"+1:08.807\"},\"FastestLap\":{\"rank\":\"11\",\"lap\":\"65\",\"Time\":{\"time\":\"1:20.406\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"192.702\"}}}]},{\"season\":\"2019\",\"round\":\"19\",\"url\":\"https://en.wikipedia.org/wiki/2019_United_States_Grand_Prix\",\"raceName\":\"United States Grand Prix\",\"Circuit\":{\"circuitId\":\"americas\",\"url\":\"http://en.wikipedia.org/wiki/Circuit_of_the_Americas\",\"circuitName\":\"Circuit of the Americas\",\"Location\":{\"lat\":\"30.1328\",\"long\":\"-97.6411\",\"locality\":\"Austin\",\"country\":\"USA\"}},\"date\":\"2019-11-03\",\"time\":\"19:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"3\",\"positionText\":\"3\",\"points\":\"15\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"3\",\"laps\":\"56\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5640655\",\"time\":\"+5.002\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"42\",\"Time\":{\"time\":\"1:38.214\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"202.077\"}}}]},{\"season\":\"2019\",\"round\":\"20\",\"url\":\"https://en.wikipedia.org/wiki/2019_Brazilian_Grand_Prix\",\"raceName\":\"Brazilian Grand Prix\",\"Circuit\":{\"circuitId\":\"interlagos\",\"url\":\"http://en.wikipedia.org/wiki/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace\",\"circuitName\":\"Autódromo José Carlos Pace\",\"Location\":{\"lat\":\"-23.7036\",\"long\":\"-46.6997\",\"locality\":\"São Paulo\",\"country\":\"Brazil\"}},\"date\":\"2019-11-17\",\"time\":\"17:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"1\",\"positionText\":\"1\",\"points\":\"25\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"1\",\"laps\":\"71\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5594678\",\"time\":\"1:33:14.678\"},\"FastestLap\":{\"rank\":\"2\",\"lap\":\"61\",\"Time\":{\"time\":\"1:10.862\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"218.909\"}}}]},{\"season\":\"2019\",\"round\":\"21\",\"url\":\"https://en.wikipedia.org/wiki/2019_Abu_Dhabi_Grand_Prix\",\"raceName\":\"Abu Dhabi Grand Prix\",\"Circuit\":{\"circuitId\":\"yas_marina\",\"url\":\"http://en.wikipedia.org/wiki/Yas_Marina_Circuit\",\"circuitName\":\"Yas Marina Circuit\",\"Location\":{\"lat\":\"24.4672\",\"long\":\"54.6031\",\"locality\":\"Abu Dhabi\",\"country\":\"UAE\"}},\"date\":\"2019-12-01\",\"time\":\"13:10:00Z\",\"Results\":[{\"number\":\"33\",\"position\":\"2\",\"positionText\":\"2\",\"points\":\"18\",\"Driver\":{\"driverId\":\"max_verstappen\",\"permanentNumber\":\"33\",\"code\":\"VER\",\"url\":\"http://en.wikipedia.org/wiki/Max_Verstappen\",\"givenName\":\"Max\",\"familyName\":\"Verstappen\",\"dateOfBirth\":\"1997-09-30\",\"nationality\":\"Dutch\"},\"Constructor\":{\"constructorId\":\"red_bull\",\"url\":\"http://en.wikipedia.org/wiki/Red_Bull_Racing\",\"name\":\"Red Bull\",\"nationality\":\"Austrian\"},\"grid\":\"2\",\"laps\":\"55\",\"status\":\"Finished\",\"Time\":{\"millis\":\"5662487\",\"time\":\"+16.772\"},\"FastestLap\":{\"rank\":\"5\",\"lap\":\"55\",\"Time\":{\"time\":\"1:41.119\"},\"AverageSpeed\":{\"units\":\"kph\",\"speed\":\"197.731\"}}}]}]}}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_26__results", results)
  });
}

#[test]
fn scenario_27() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "locations",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":city",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_8",
        "name": "city",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_5",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_5",
        "name": "lat",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_5",
        "name": "long",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$optional",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_8",
        "name": "coordinates",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_8",
        "name": "population",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_9",
        "name": "principality",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_7",
        "shapeId": "shape_10",
        "name": "location",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_7",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_6",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_5"
              }
            },
            "consumingParameterId": "$optionalInner"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/locations/sf",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "Ek0KCGxvY2F0aW9uEkESPwoMcHJpbmNpcGFsaXR5Ei8SCgoEY2l0eRICCAISEAoKcG9wdWxhdGlvbhICCAMSDwoLY29vcmRpbmF0ZXMSAA==",
          "asJsonString": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"coordinates\":{}}}}",
          "asText": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"coordinates\":{}}}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_27__results", results)
  });
}

#[test]
fn scenario_28() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "people",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_14",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_14",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_1",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_12",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_12",
        "name": "colors",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_10"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_12",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_11"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_13",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_10",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_9"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_13",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_12"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_13",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> = serde_json::from_value(json!([
    {
      "uuid": "id",
      "request": {
        "host": "example.com",
        "method": "GET",
        "path": "/people",
        "query": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": null,
          "value": {
            "shapeHashV1Base64": null,
            "asJsonString": null,
            "asText": null
          }
        }
      },
      "response": {
        "statusCode": 200,
        "headers": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        },
        "body": {
          "contentType": "application/json",
          "value": {
            "shapeHashV1Base64": "CAE=",
            "asJsonString": "[]",
            "asText": "[]"
          }
        }
      },
      "tags": []
    }
  ]))
  .expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_28__results", results)
  });
}

#[test]
fn scenario_29() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "locations",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":city",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_2",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_8",
        "name": "city",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_5",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_5",
        "name": "lat",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_5",
        "name": "long",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$optional",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_8",
        "name": "coordinates",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_8",
        "name": "population",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_9",
        "name": "principality",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_7",
        "shapeId": "shape_10",
        "name": "location",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_7",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_6",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_5"
              }
            },
            "consumingParameterId": "$optionalInner"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/locations/sf",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EkkKCGxvY2F0aW9uEj0SOwoMcHJpbmNpcGFsaXR5EisSCgoEY2l0eRICCAISEAoKcG9wdWxhdGlvbhICCAMSCwoFYXJyYXkSAggB",
          "asJsonString": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"array\":[]}}}",
          "asText": "{\"location\":{\"principality\":{\"city\":\"San Fransisco\",\"population\":830000,\"array\":[]}}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_29__results", results)
  });
}

#[test]
fn scenario_30() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "baseline-path_2",
        "parentPathId": "baseline-path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_9",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "baseline-path_2",
        "shapeDescriptor": {
          "shapeId": "baseline-shape_9",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "baseline-path_3",
        "parentPathId": "baseline-path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "baseline-request-parameter_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "baseline-request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "baseline-shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "baseline-request_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "baseline-response_1",
        "pathId": "baseline-path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_8",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_2",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_1",
        "shapeId": "baseline-shape_8",
        "name": "age",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_1",
            "shapeId": "baseline-shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_4",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_5",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_2",
        "shapeId": "baseline-shape_8",
        "name": "cities",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_2",
            "shapeId": "baseline-shape_5"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_3",
        "shapeId": "baseline-shape_8",
        "name": "firstName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_3",
            "shapeId": "baseline-shape_6"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "baseline-shape_7",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "baseline-field_4",
        "shapeId": "baseline-shape_8",
        "name": "lastName",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "baseline-field_4",
            "shapeId": "baseline-shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "baseline-shape_5",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "baseline-shape_4"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "baseline-response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "baseline-shape_8",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "Eg8KCWZpcnN0TmFtZRICCAISDgoIbGFzdE5hbWUSAggCEgkKA2FnZRICCAMSGAoGY2l0aWVzEg4IARoCCAIaAggCGgIIAg==",
          "asJsonString": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",\"New York\",\"Durham\"]}",
          "asText": "{\"firstName\":\"Aidan\",\"lastName\":\"C\",\"age\":26,\"cities\":[\"San Fransisco\",\"New York\",\"Durham\"]}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_30__results", results)
  });
}

#[test]
fn scenario_31() {
  let events: Vec<SpecEvent> = serde_json::from_value(json!([
    {
      "PathComponentAdded": {
        "pathId": "path_1",
        "parentPathId": "root",
        "name": "users",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "PathParameterAdded": {
        "pathId": "path_2",
        "parentPathId": "path_1",
        "name": ":userId",
        "eventContext": null
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_11",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": null
      }
    },
    {
      "PathParameterShapeSet": {
        "pathId": "path_2",
        "shapeDescriptor": {
          "shapeId": "shape_11",
          "isRemoved": false
        },
        "eventContext": null
      }
    },
    {
      "PathComponentAdded": {
        "pathId": "path_3",
        "parentPathId": "path_2",
        "name": "profile",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterAddedByPathAndMethod": {
        "parameterId": "request-parameter_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "parameterLocation": "query",
        "name": "queryString",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_12",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestParameterShapeSet": {
        "parameterId": "request-parameter_1",
        "parameterDescriptor": {
          "shapeId": "shape_12",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "RequestAdded": {
        "requestId": "request_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseAddedByPathAndMethod": {
        "responseId": "response_1",
        "pathId": "path_3",
        "httpMethod": "GET",
        "httpStatusCode": 200,
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_10",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_4",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_2",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_1",
        "shapeId": "shape_4",
        "name": "first",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_1",
            "shapeId": "shape_2"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_3",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_2",
        "shapeId": "shape_4",
        "name": "last",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_2",
            "shapeId": "shape_3"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_3",
        "shapeId": "shape_10",
        "name": "name",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_3",
            "shapeId": "shape_4"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_6",
        "baseShapeId": "$string",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_7",
        "baseShapeId": "$list",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_4",
        "shapeId": "shape_10",
        "name": "rivals",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_4",
            "shapeId": "shape_7"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_9",
        "baseShapeId": "$object",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeAdded": {
        "shapeId": "shape_8",
        "baseShapeId": "$number",
        "parameters": {
          "DynamicParameterList": {
            "shapeParameterIds": []
          }
        },
        "name": "",
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_5",
        "shapeId": "shape_9",
        "name": "rank",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_5",
            "shapeId": "shape_8"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "FieldAdded": {
        "fieldId": "field_6",
        "shapeId": "shape_10",
        "name": "stats",
        "shapeDescriptor": {
          "FieldShapeFromShape": {
            "fieldId": "field_6",
            "shapeId": "shape_9"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ShapeParameterShapeSet": {
        "shapeDescriptor": {
          "ProviderInShape": {
            "shapeId": "shape_7",
            "providerDescriptor": {
              "ShapeProvider": {
                "shapeId": "shape_6"
              }
            },
            "consumingParameterId": "$listItem"
          }
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    },
    {
      "ResponseBodySet": {
        "responseId": "response_1",
        "bodyDescriptor": {
          "httpContentType": "application/json",
          "shapeId": "shape_10",
          "isRemoved": false
        },
        "eventContext": {
          "clientId": "ccc",
          "clientSessionId": "sss",
          "clientCommandBatchId": "bbb",
          "createdAt": "NOW"
        }
      }
    }
  ]))
  .expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> =
      serde_json::from_value(json!([
  {
    "uuid": "id",
    "request": {
      "host": "example.com",
      "method": "GET",
      "path": "/users/1234/profile",
      "query": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": null,
        "value": {
          "shapeHashV1Base64": null,
          "asJsonString": null,
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 200,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "EiEKBG5hbWUSGRILCgVmaXJzdBICCAISCgoEbGFzdBICCAISGQoGcml2YWxzEg8SDQoHbmVtZXNpcxICCAISFQoFc3RhdHMSDBIKCgRyYW5rEgIIAw==",
          "asJsonString": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":{\"nemesis\":\"Brad\"},\"stats\":{\"rank\":1}}",
          "asText": "{\"name\":{\"first\":\"Bob\",\"last\":\"C\"},\"rivals\":{\"nemesis\":\"Brad\"},\"stats\":{\"rank\":1}}"
        }
      }
    },
    "tags": []
  }
])).expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
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

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_31__results", results)
  });
}
