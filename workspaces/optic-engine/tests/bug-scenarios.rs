#![recursion_limit = "2560"]
use insta::assert_debug_snapshot;
use optic_engine::{diff_interaction, HttpInteraction, SpecEvent, SpecProjection};
use petgraph::dot::Dot;
use serde_json::json;

#[test]
fn scenario_32() {
  let events: Vec<SpecEvent> =
        serde_json::from_value(json!([
    {
        "PathComponentAdded": {
            "pathId": "path_U88jQ2isJy",
            "parentPathId": "root",
            "name": "following",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "42e96bdb-3d85-425a-8aad-af268369de5b",
                "createdAt": "2020-11-06T15:42:28.593Z"
            }
        }
    },
    {
        "PathComponentAdded": {
            "pathId": "path_reFAf3Kwia",
            "parentPathId": "path_U88jQ2isJy",
            "name": "drivers",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "42e96bdb-3d85-425a-8aad-af268369de5b",
                "createdAt": "2020-11-06T15:42:28.596Z"
            }
        }
    },
    {
        "ContributionAdded": {
            "id": "path_reFAf3Kwia.POST",
            "key": "purpose",
            "value": "asdf",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "42e96bdb-3d85-425a-8aad-af268369de5b",
                "createdAt": "2020-11-06T15:42:28.597Z"
            }
        }
    },
    {
        "BatchCommitStarted": {
            "batchId": "db99cd00-746a-4a43-b117-6adc53f24291",
            "commitMessage": "\n\nChanges:\n- Added Request with 'application/json' Content-Type \n- Added '201' Response with 'application/json' Content-Type \n- Added '400' Response with 'application/json' Content-Type ",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "9af7b401-50e5-4bb0-bcfe-7c67a4d4b33a",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "RequestParameterAddedByPathAndMethod": {
            "parameterId": "request-parameter_MR1jvUSr8z",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "parameterLocation": "query",
            "name": "queryString",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_QDWTCba6JM",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "RequestParameterShapeSet": {
            "parameterId": "request-parameter_MR1jvUSr8z",
            "parameterDescriptor": {
                "shapeId": "shape_QDWTCba6JM",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "RequestAdded": {
            "requestId": "request_ItvwdwotUU",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_eaAktz66rY",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_pQvxnF8pzK",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_Tubl0dSyKp",
            "shapeId": "shape_eaAktz66rY",
            "name": "driverId",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_Tubl0dSyKp",
                    "shapeId": "shape_pQvxnF8pzK"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "RequestBodySet": {
            "requestId": "request_ItvwdwotUU",
            "bodyDescriptor": {
                "httpContentType": "application/json",
                "shapeId": "shape_eaAktz66rY",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "ResponseAddedByPathAndMethod": {
            "responseId": "response_Oq3x4otca8",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "httpStatusCode": 201,
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_xjqKoYgnH6",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_iJajSC9l5W",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_ZgQow0SS6x",
            "shapeId": "shape_xjqKoYgnH6",
            "name": "driverId",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_ZgQow0SS6x",
                    "shapeId": "shape_iJajSC9l5W"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_p5uOLpFNK8",
            "baseShapeId": "$unknown",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_lhl794TnL5",
            "baseShapeId": "$nullable",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_dcJtyX4lH0",
            "shapeId": "shape_xjqKoYgnH6",
            "name": "rating",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_dcJtyX4lH0",
                    "shapeId": "shape_lhl794TnL5"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ShapeParameterShapeSet": {
            "shapeDescriptor": {
                "ProviderInShape": {
                    "shapeId": "shape_lhl794TnL5",
                    "providerDescriptor": {
                        "ShapeProvider": {
                            "shapeId": "shape_p5uOLpFNK8"
                        }
                    },
                    "consumingParameterId": "$nullableInner"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ResponseBodySet": {
            "responseId": "response_Oq3x4otca8",
            "bodyDescriptor": {
                "httpContentType": "application/json",
                "shapeId": "shape_xjqKoYgnH6",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ResponseAddedByPathAndMethod": {
            "responseId": "response_np7lD9lfHq",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "httpStatusCode": 400,
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_GgIZ9GsJQm",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_Z4UKWHMaIx",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_m1iuljZLRJ",
            "shapeId": "shape_GgIZ9GsJQm",
            "name": "error",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_m1iuljZLRJ",
                    "shapeId": "shape_Z4UKWHMaIx"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_tavNflZKsw",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_dZ1hPWdKA3",
            "shapeId": "shape_GgIZ9GsJQm",
            "name": "message",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_dZ1hPWdKA3",
                    "shapeId": "shape_tavNflZKsw"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_T0WnrnVHU2",
            "baseShapeId": "$number",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_nZPLYXVLoE",
            "shapeId": "shape_GgIZ9GsJQm",
            "name": "statusCode",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_nZPLYXVLoE",
                    "shapeId": "shape_T0WnrnVHU2"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.198Z"
            }
        }
    },
    {
        "ResponseBodySet": {
            "responseId": "response_np7lD9lfHq",
            "bodyDescriptor": {
                "httpContentType": "application/json",
                "shapeId": "shape_GgIZ9GsJQm",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.198Z"
            }
        }
    },
    {
        "BatchCommitEnded": {
            "batchId": "db99cd00-746a-4a43-b117-6adc53f24291",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "2938d092-52da-42c3-a9f0-da8a4e04a7ba",
                "createdAt": "2020-11-06T15:44:29.198Z"
            }
        }
    }
])).expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> = serde_json::from_value(json!([
  {
    "uuid": "8d8d28eb-2fa4-4835-bd3c-b3855d731d05",
    "request": {
      "host": "localhost",
      "method": "POST",
      "path": "/following/drivers",
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
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "CAASDgoIZHJpdmVySWQSAggCEgwKBnJhdGluZxICCAM=",
          "asJsonString": "{\"driverId\":\"hamilton\",\"rating\":5}",
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 201,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "CAASDgoIZHJpdmVySWQSAggCEgwKBnJhdGluZxICCAM=",
          "asJsonString": "{\"driverId\":\"hamilton\",\"rating\":5}",
          "asText": null
        }
      }
    },
    "tags": []
  }
  ]))
  .expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
  assert_debug_snapshot!(
    "scenario_32__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_32__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_32__results", results)
  });
}

#[test]
fn scenario_33() {
  let events: Vec<SpecEvent> =
        serde_json::from_value(json!([
    {
        "PathComponentAdded": {
            "pathId": "path_U88jQ2isJy",
            "parentPathId": "root",
            "name": "following",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "42e96bdb-3d85-425a-8aad-af268369de5b",
                "createdAt": "2020-11-06T15:42:28.593Z"
            }
        }
    },
    {
        "PathComponentAdded": {
            "pathId": "path_reFAf3Kwia",
            "parentPathId": "path_U88jQ2isJy",
            "name": "drivers",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "42e96bdb-3d85-425a-8aad-af268369de5b",
                "createdAt": "2020-11-06T15:42:28.596Z"
            }
        }
    },
    {
        "ContributionAdded": {
            "id": "path_reFAf3Kwia.POST",
            "key": "purpose",
            "value": "asdf",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "42e96bdb-3d85-425a-8aad-af268369de5b",
                "createdAt": "2020-11-06T15:42:28.597Z"
            }
        }
    },
    {
        "BatchCommitStarted": {
            "batchId": "db99cd00-746a-4a43-b117-6adc53f24291",
            "commitMessage": "\n\nChanges:\n- Added Request with 'application/json' Content-Type \n- Added '201' Response with 'application/json' Content-Type \n- Added '400' Response with 'application/json' Content-Type ",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "9af7b401-50e5-4bb0-bcfe-7c67a4d4b33a",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "RequestParameterAddedByPathAndMethod": {
            "parameterId": "request-parameter_MR1jvUSr8z",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "parameterLocation": "query",
            "name": "queryString",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_QDWTCba6JM",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "RequestParameterShapeSet": {
            "parameterId": "request-parameter_MR1jvUSr8z",
            "parameterDescriptor": {
                "shapeId": "shape_QDWTCba6JM",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "RequestAdded": {
            "requestId": "request_ItvwdwotUU",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_eaAktz66rY",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_pQvxnF8pzK",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_Tubl0dSyKp",
            "shapeId": "shape_eaAktz66rY",
            "name": "driverId",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_Tubl0dSyKp",
                    "shapeId": "shape_pQvxnF8pzK"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "RequestBodySet": {
            "requestId": "request_ItvwdwotUU",
            "bodyDescriptor": {
                "httpContentType": "application/json",
                "shapeId": "shape_eaAktz66rY",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "ResponseAddedByPathAndMethod": {
            "responseId": "response_Oq3x4otca8",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "httpStatusCode": 201,
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_xjqKoYgnH6",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_iJajSC9l5W",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_ZgQow0SS6x",
            "shapeId": "shape_xjqKoYgnH6",
            "name": "driverId",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_ZgQow0SS6x",
                    "shapeId": "shape_iJajSC9l5W"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_p5uOLpFNK8",
            "baseShapeId": "$unknown",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_lhl794TnL5",
            "baseShapeId": "$nullable",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_dcJtyX4lH0",
            "shapeId": "shape_xjqKoYgnH6",
            "name": "rating",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_dcJtyX4lH0",
                    "shapeId": "shape_lhl794TnL5"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ShapeParameterShapeSet": {
            "shapeDescriptor": {
                "ProviderInShape": {
                    "shapeId": "shape_lhl794TnL5",
                    "providerDescriptor": {
                        "ShapeProvider": {
                            "shapeId": "shape_p5uOLpFNK8"
                        }
                    },
                    "consumingParameterId": "$nullableInner"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ResponseBodySet": {
            "responseId": "response_Oq3x4otca8",
            "bodyDescriptor": {
                "httpContentType": "application/json",
                "shapeId": "shape_xjqKoYgnH6",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ResponseAddedByPathAndMethod": {
            "responseId": "response_np7lD9lfHq",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "httpStatusCode": 400,
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_GgIZ9GsJQm",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_Z4UKWHMaIx",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_m1iuljZLRJ",
            "shapeId": "shape_GgIZ9GsJQm",
            "name": "error",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_m1iuljZLRJ",
                    "shapeId": "shape_Z4UKWHMaIx"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_tavNflZKsw",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_dZ1hPWdKA3",
            "shapeId": "shape_GgIZ9GsJQm",
            "name": "message",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_dZ1hPWdKA3",
                    "shapeId": "shape_tavNflZKsw"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_T0WnrnVHU2",
            "baseShapeId": "$number",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_nZPLYXVLoE",
            "shapeId": "shape_GgIZ9GsJQm",
            "name": "statusCode",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_nZPLYXVLoE",
                    "shapeId": "shape_T0WnrnVHU2"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.198Z"
            }
        }
    },
    {
        "ResponseBodySet": {
            "responseId": "response_np7lD9lfHq",
            "bodyDescriptor": {
                "httpContentType": "application/json",
                "shapeId": "shape_GgIZ9GsJQm",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.198Z"
            }
        }
    },
    {
        "BatchCommitEnded": {
            "batchId": "db99cd00-746a-4a43-b117-6adc53f24291",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "2938d092-52da-42c3-a9f0-da8a4e04a7ba",
                "createdAt": "2020-11-06T15:44:29.198Z"
            }
        }
    },
    {
        "BatchCommitStarted": {
            "batchId": "2bf72d33-f352-42e3-be1d-54e8014fa1ec",
            "commitMessage": "\n\nChanges:\n- Added field 'rating' as 'Number'",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "e8e8456f-4c40-47e9-866f-d00c627c0d7e",
                "clientCommandBatchId": "04f295da-c124-4592-abf7-b5ade50562a8",
                "createdAt": "2020-11-06T15:53:24.470Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_qxsk3PMiAC",
            "baseShapeId": "$number",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "e8e8456f-4c40-47e9-866f-d00c627c0d7e",
                "clientCommandBatchId": "57402420-4563-4328-8e27-2619d62f2878",
                "createdAt": "2020-11-06T15:53:24.471Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_fFNfMm41ym",
            "shapeId": "shape_eaAktz66rY",
            "name": "rating",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_fFNfMm41ym",
                    "shapeId": "shape_qxsk3PMiAC"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "e8e8456f-4c40-47e9-866f-d00c627c0d7e",
                "clientCommandBatchId": "57402420-4563-4328-8e27-2619d62f2878",
                "createdAt": "2020-11-06T15:53:24.471Z"
            }
        }
    },
    {
        "BatchCommitEnded": {
            "batchId": "2bf72d33-f352-42e3-be1d-54e8014fa1ec",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "e8e8456f-4c40-47e9-866f-d00c627c0d7e",
                "clientCommandBatchId": "bdd85c3e-6b56-4eaf-8bb2-1d5d87931789",
                "createdAt": "2020-11-06T15:53:24.472Z"
            }
        }
    }
])).expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> = serde_json::from_value(json!([
  {
    "uuid": "8d8d28eb-2fa4-4835-bd3c-b3855d731d05",
    "request": {
      "host": "localhost",
      "method": "POST",
      "path": "/following/drivers",
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
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "CAASDgoIZHJpdmVySWQSAggCEgwKBnJhdGluZxICCAM=",
          "asJsonString": "{\"driverId\":\"hamilton\",\"rating\":5}",
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 201,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "CAASDgoIZHJpdmVySWQSAggCEgwKBnJhdGluZxICCAM=",
          "asJsonString": "{\"driverId\":\"hamilton\",\"rating\":5}",
          "asText": null
        }
      }
    },
    "tags": []
  }
  ]))
  .expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
  assert_debug_snapshot!(
    "scenario_33__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_33__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_33__results", results)
  });
}

#[test]
fn scenario_34() {
  let events: Vec<SpecEvent> =
        serde_json::from_value(json!([
    {
        "PathComponentAdded": {
            "pathId": "path_U88jQ2isJy",
            "parentPathId": "root",
            "name": "following",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "42e96bdb-3d85-425a-8aad-af268369de5b",
                "createdAt": "2020-11-06T15:42:28.593Z"
            }
        }
    },
    {
        "PathComponentAdded": {
            "pathId": "path_reFAf3Kwia",
            "parentPathId": "path_U88jQ2isJy",
            "name": "drivers",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "42e96bdb-3d85-425a-8aad-af268369de5b",
                "createdAt": "2020-11-06T15:42:28.596Z"
            }
        }
    },
    {
        "ContributionAdded": {
            "id": "path_reFAf3Kwia.POST",
            "key": "purpose",
            "value": "asdf",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "42e96bdb-3d85-425a-8aad-af268369de5b",
                "createdAt": "2020-11-06T15:42:28.597Z"
            }
        }
    },
    {
        "BatchCommitStarted": {
            "batchId": "db99cd00-746a-4a43-b117-6adc53f24291",
            "commitMessage": "\n\nChanges:\n- Added Request with 'application/json' Content-Type \n- Added '201' Response with 'application/json' Content-Type \n- Added '400' Response with 'application/json' Content-Type ",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "9af7b401-50e5-4bb0-bcfe-7c67a4d4b33a",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "RequestParameterAddedByPathAndMethod": {
            "parameterId": "request-parameter_MR1jvUSr8z",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "parameterLocation": "query",
            "name": "queryString",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_QDWTCba6JM",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "RequestParameterShapeSet": {
            "parameterId": "request-parameter_MR1jvUSr8z",
            "parameterDescriptor": {
                "shapeId": "shape_QDWTCba6JM",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "RequestAdded": {
            "requestId": "request_ItvwdwotUU",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_eaAktz66rY",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.194Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_pQvxnF8pzK",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_Tubl0dSyKp",
            "shapeId": "shape_eaAktz66rY",
            "name": "driverId",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_Tubl0dSyKp",
                    "shapeId": "shape_pQvxnF8pzK"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "RequestBodySet": {
            "requestId": "request_ItvwdwotUU",
            "bodyDescriptor": {
                "httpContentType": "application/json",
                "shapeId": "shape_eaAktz66rY",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "d6848d8b-33d1-4437-a81c-ec27bea86fb2",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "ResponseAddedByPathAndMethod": {
            "responseId": "response_Oq3x4otca8",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "httpStatusCode": 201,
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_xjqKoYgnH6",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.195Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_iJajSC9l5W",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_ZgQow0SS6x",
            "shapeId": "shape_xjqKoYgnH6",
            "name": "driverId",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_ZgQow0SS6x",
                    "shapeId": "shape_iJajSC9l5W"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_p5uOLpFNK8",
            "baseShapeId": "$unknown",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_lhl794TnL5",
            "baseShapeId": "$nullable",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_dcJtyX4lH0",
            "shapeId": "shape_xjqKoYgnH6",
            "name": "rating",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_dcJtyX4lH0",
                    "shapeId": "shape_lhl794TnL5"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ShapeParameterShapeSet": {
            "shapeDescriptor": {
                "ProviderInShape": {
                    "shapeId": "shape_lhl794TnL5",
                    "providerDescriptor": {
                        "ShapeProvider": {
                            "shapeId": "shape_p5uOLpFNK8"
                        }
                    },
                    "consumingParameterId": "$nullableInner"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ResponseBodySet": {
            "responseId": "response_Oq3x4otca8",
            "bodyDescriptor": {
                "httpContentType": "application/json",
                "shapeId": "shape_xjqKoYgnH6",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "673a8333-7383-44b9-a5a2-10128c461de4",
                "createdAt": "2020-11-06T15:44:29.196Z"
            }
        }
    },
    {
        "ResponseAddedByPathAndMethod": {
            "responseId": "response_np7lD9lfHq",
            "pathId": "path_reFAf3Kwia",
            "httpMethod": "POST",
            "httpStatusCode": 400,
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_GgIZ9GsJQm",
            "baseShapeId": "$object",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_Z4UKWHMaIx",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_m1iuljZLRJ",
            "shapeId": "shape_GgIZ9GsJQm",
            "name": "error",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_m1iuljZLRJ",
                    "shapeId": "shape_Z4UKWHMaIx"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_tavNflZKsw",
            "baseShapeId": "$string",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_dZ1hPWdKA3",
            "shapeId": "shape_GgIZ9GsJQm",
            "name": "message",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_dZ1hPWdKA3",
                    "shapeId": "shape_tavNflZKsw"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_T0WnrnVHU2",
            "baseShapeId": "$number",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.197Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_nZPLYXVLoE",
            "shapeId": "shape_GgIZ9GsJQm",
            "name": "statusCode",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_nZPLYXVLoE",
                    "shapeId": "shape_T0WnrnVHU2"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.198Z"
            }
        }
    },
    {
        "ResponseBodySet": {
            "responseId": "response_np7lD9lfHq",
            "bodyDescriptor": {
                "httpContentType": "application/json",
                "shapeId": "shape_GgIZ9GsJQm",
                "isRemoved": false
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "8b983f1e-3065-471e-90c7-33751386954b",
                "createdAt": "2020-11-06T15:44:29.198Z"
            }
        }
    },
    {
        "BatchCommitEnded": {
            "batchId": "db99cd00-746a-4a43-b117-6adc53f24291",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "cb1a2519-e5f2-4571-b843-686685905890",
                "clientCommandBatchId": "2938d092-52da-42c3-a9f0-da8a4e04a7ba",
                "createdAt": "2020-11-06T15:44:29.198Z"
            }
        }
    },
    {
        "BatchCommitStarted": {
            "batchId": "2bf72d33-f352-42e3-be1d-54e8014fa1ec",
            "commitMessage": "\n\nChanges:\n- Added field 'rating' as 'Number'",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "e8e8456f-4c40-47e9-866f-d00c627c0d7e",
                "clientCommandBatchId": "04f295da-c124-4592-abf7-b5ade50562a8",
                "createdAt": "2020-11-06T15:53:24.470Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_qxsk3PMiAC",
            "baseShapeId": "$number",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "e8e8456f-4c40-47e9-866f-d00c627c0d7e",
                "clientCommandBatchId": "57402420-4563-4328-8e27-2619d62f2878",
                "createdAt": "2020-11-06T15:53:24.471Z"
            }
        }
    },
    {
        "FieldAdded": {
            "fieldId": "field_fFNfMm41ym",
            "shapeId": "shape_eaAktz66rY",
            "name": "rating",
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_fFNfMm41ym",
                    "shapeId": "shape_qxsk3PMiAC"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "e8e8456f-4c40-47e9-866f-d00c627c0d7e",
                "clientCommandBatchId": "57402420-4563-4328-8e27-2619d62f2878",
                "createdAt": "2020-11-06T15:53:24.471Z"
            }
        }
    },
    {
        "BatchCommitEnded": {
            "batchId": "2bf72d33-f352-42e3-be1d-54e8014fa1ec",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "e8e8456f-4c40-47e9-866f-d00c627c0d7e",
                "clientCommandBatchId": "bdd85c3e-6b56-4eaf-8bb2-1d5d87931789",
                "createdAt": "2020-11-06T15:53:24.472Z"
            }
        }
    },
    {
        "BatchCommitStarted": {
            "batchId": "825154e4-6ffe-44b6-b470-475195f59d90",
            "commitMessage": "\n\nChanges:\n- Make field 'rating' optional",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "97ac5554-06d6-4f73-b7e2-b91fb5de6c52",
                "clientCommandBatchId": "502c86b7-18e8-4fd8-b667-da9789e344b5",
                "createdAt": "2020-11-06T15:55:43.876Z"
            }
        }
    },
    {
        "ShapeAdded": {
            "shapeId": "shape_EAkFpmR8W4",
            "baseShapeId": "$optional",
            "parameters": {
                "DynamicParameterList": {
                    "shapeParameterIds": []
                }
            },
            "name": "",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "97ac5554-06d6-4f73-b7e2-b91fb5de6c52",
                "clientCommandBatchId": "808e2237-d160-44b3-83c6-517d6ad3cc01",
                "createdAt": "2020-11-06T15:55:43.877Z"
            }
        }
    },
    {
        "ShapeParameterShapeSet": {
            "shapeDescriptor": {
                "ProviderInShape": {
                    "shapeId": "shape_EAkFpmR8W4",
                    "providerDescriptor": {
                        "ShapeProvider": {
                            "shapeId": "shape_qxsk3PMiAC"
                        }
                    },
                    "consumingParameterId": "$optionalInner"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "97ac5554-06d6-4f73-b7e2-b91fb5de6c52",
                "clientCommandBatchId": "808e2237-d160-44b3-83c6-517d6ad3cc01",
                "createdAt": "2020-11-06T15:55:43.877Z"
            }
        }
    },
    {
        "FieldShapeSet": {
            "shapeDescriptor": {
                "FieldShapeFromShape": {
                    "fieldId": "field_fFNfMm41ym",
                    "shapeId": "shape_EAkFpmR8W4"
                }
            },
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "97ac5554-06d6-4f73-b7e2-b91fb5de6c52",
                "clientCommandBatchId": "808e2237-d160-44b3-83c6-517d6ad3cc01",
                "createdAt": "2020-11-06T15:55:43.877Z"
            }
        }
    },
    {
        "BatchCommitEnded": {
            "batchId": "825154e4-6ffe-44b6-b470-475195f59d90",
            "eventContext": {
                "clientId": "anonymous",
                "clientSessionId": "97ac5554-06d6-4f73-b7e2-b91fb5de6c52",
                "clientCommandBatchId": "d4984edc-df3e-4efc-b2a1-ae484ea3c85a",
                "createdAt": "2020-11-06T15:55:43.878Z"
            }
        }
    }
])).expect("should be able to deserialize events");
  let interactions: Vec<HttpInteraction> = serde_json::from_value(json!([
  {
    "uuid": "63cdbd35-d5d2-43aa-b2b8-0ba7d726b610",
    "request": {
      "host": "localhost",
      "method": "POST",
      "path": "/following/drivers",
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
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "CAASDgoIZHJpdmVySWQSAggC",
          "asJsonString": "{\"driverId\":\"max_verstappen\"}",
          "asText": null
        }
      }
    },
    "response": {
      "statusCode": 201,
      "headers": {
        "shapeHashV1Base64": null,
        "asJsonString": null,
        "asText": null
      },
      "body": {
        "contentType": "application/json",
        "value": {
          "shapeHashV1Base64": "CAASDgoIZHJpdmVySWQSAggCEgwKBnJhdGluZxICCAU=",
          "asJsonString": "{\"driverId\":\"max_verstappen\",\"rating\":null}",
          "asText": null
        }
      }
    },
    "tags": []
  }
  ]))
  .expect("should be able to deserialize interactions");
  let spec_projection = SpecProjection::from(events);
  assert_debug_snapshot!(
    "scenario_34__shape_graph",
    Dot::with_config(&spec_projection.shape().graph, &[])
  );
  assert_debug_snapshot!(
    "scenario_34__endpoints_graph",
    Dot::with_config(&spec_projection.endpoint().graph, &[])
  );

  interactions.into_iter().for_each(|interaction| {
    let results = diff_interaction(&spec_projection, interaction);
    assert_debug_snapshot!("scenario_34__results", results)
  });
}
