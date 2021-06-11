/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`lib/spawn.js TAP diff-engine.spawn can diff a stream of interactions > generated diffs 1`] = `
Array [
  Array [
    Object {
      "UnmatchedResponseBodyShape": Object {
        "interactionTrail": Object {
          "path": Array [
            Object {
              "ResponseBody": Object {
                "contentType": "application/json",
                "statusCode": 201,
              },
            },
          ],
        },
        "requestsTrail": Object {
          "SpecResponseBody": Object {
            "responseId": "response_bK58ebkIt4",
          },
        },
        "shapeDiffResult": Object {
          "UnmatchedShape": Object {
            "jsonTrail": Object {
              "path": Array [
                Object {
                  "JsonObjectKey": Object {
                    "key": "rating",
                  },
                },
              ],
            },
            "shapeTrail": Object {
              "path": Array [
                Object {
                  "ObjectFieldTrail": Object {
                    "fieldId": "Dzhqpq_3",
                    "fieldShapeId": "Dzhqpq_4",
                  },
                },
                Object {
                  "NullableTrail": Object {
                    "shapeId": "Dzhqpq_4",
                  },
                },
              ],
              "rootShapeId": "Dzhqpq_0",
            },
          },
        },
      },
    },
    Array [
      "5-3",
    ],
    "32534ed924562f86",
  ],
  Array [
    Object {
      "UnmatchedRequestUrl": Object {
        "interactionTrail": Object {
          "path": Array [
            Object {
              "Url": Object {
                "path": "/api/f1/2019/constructors/red_bull",
              },
            },
            Object {
              "Method": Object {
                "method": "GET",
              },
            },
          ],
        },
        "requestsTrail": Object {
          "SpecRoot": Object {},
        },
      },
    },
    Array [
      "3-0",
    ],
    "8253c1e0cc6d8fdd",
  ],
  Array [
    Object {
      "UnmatchedRequestBodyShape": Object {
        "interactionTrail": Object {
          "path": Array [
            Object {
              "RequestBody": Object {
                "contentType": "application/json",
              },
            },
          ],
        },
        "requestsTrail": Object {
          "SpecRequestBody": Object {
            "requestId": "request_NR43nZPaOr",
          },
        },
        "shapeDiffResult": Object {
          "UnspecifiedShape": Object {
            "jsonTrail": Object {
              "path": Array [
                Object {
                  "JsonObjectKey": Object {
                    "key": "rating",
                  },
                },
              ],
            },
            "shapeTrail": Object {
              "path": Array [],
              "rootShapeId": "SGyna3_0",
            },
          },
        },
      },
    },
    Array [
      "5-3",
    ],
    "8d0acf95859cac67",
  ],
  Array [
    Object {
      "UnmatchedRequestUrl": Object {
        "interactionTrail": Object {
          "path": Array [
            Object {
              "Url": Object {
                "path": "/api/f1/2019/drivers/max_verstappen/results",
              },
            },
            Object {
              "Method": Object {
                "method": "GET",
              },
            },
          ],
        },
        "requestsTrail": Object {
          "SpecRoot": Object {},
        },
      },
    },
    Array [
      "5-0",
    ],
    "97649e3b711c710a",
  ],
  Array [
    Object {
      "UnmatchedResponseBodyShape": Object {
        "interactionTrail": Object {
          "path": Array [
            Object {
              "ResponseBody": Object {
                "contentType": "application/json",
                "statusCode": 200,
              },
            },
          ],
        },
        "requestsTrail": Object {
          "SpecResponseBody": Object {
            "responseId": "response_nxWT5qcYhF",
          },
        },
        "shapeDiffResult": Object {
          "UnmatchedShape": Object {
            "jsonTrail": Object {
              "path": Array [
                Object {
                  "JsonObjectKey": Object {
                    "key": "MRData",
                  },
                },
                Object {
                  "JsonObjectKey": Object {
                    "key": "RaceTable",
                  },
                },
                Object {
                  "JsonObjectKey": Object {
                    "key": "Races",
                  },
                },
                Object {
                  "JsonArrayItem": Object {
                    "index": 0,
                  },
                },
                Object {
                  "JsonObjectKey": Object {
                    "key": "Results",
                  },
                },
                Object {
                  "JsonArrayItem": Object {
                    "index": 6,
                  },
                },
                Object {
                  "JsonObjectKey": Object {
                    "key": "Time",
                  },
                },
              ],
            },
            "shapeTrail": Object {
              "path": Array [
                Object {
                  "ObjectFieldTrail": Object {
                    "fieldId": "field_SsIQbb2PuY",
                    "fieldShapeId": "shape_L3dn1UwIbE",
                  },
                },
                Object {
                  "ObjectFieldTrail": Object {
                    "fieldId": "field_tKrxAuQgwL",
                    "fieldShapeId": "shape_tMhbmREmDn",
                  },
                },
                Object {
                  "ObjectFieldTrail": Object {
                    "fieldId": "field_otlCEiV7yc",
                    "fieldShapeId": "shape_RLovizBxRF",
                  },
                },
                Object {
                  "ListItemTrail": Object {
                    "itemShapeId": "shape_DsorNDPrhu",
                    "listShapeId": "shape_RLovizBxRF",
                  },
                },
                Object {
                  "ObjectFieldTrail": Object {
                    "fieldId": "field_2HCFCjyuHD",
                    "fieldShapeId": "shape_hF24KgHLk8",
                  },
                },
                Object {
                  "ListItemTrail": Object {
                    "itemShapeId": "shape_iexBOU2bX2",
                    "listShapeId": "shape_hF24KgHLk8",
                  },
                },
                Object {
                  "ObjectFieldTrail": Object {
                    "fieldId": "field_Qfj9ZPUt98",
                    "fieldShapeId": "shape_RVWAwegye0",
                  },
                },
              ],
              "rootShapeId": "shape_VGtg2HMvjl",
            },
          },
        },
      },
    },
    Array [
      "0-0",
    ],
    "9f3f6ae3e7c127c0",
  ],
  Array [
    Object {
      "UnmatchedResponseBodyContentType": Object {
        "interactionTrail": Object {
          "path": Array [
            Object {
              "Method": Object {
                "method": "GET",
              },
            },
            Object {
              "ResponseBody": Object {
                "contentType": "application/json",
                "statusCode": 200,
              },
            },
          ],
        },
        "requestsTrail": Object {
          "SpecPath": Object {
            "pathId": "path_C3V8NNm66A",
          },
        },
      },
    },
    Array [
      "3-1",
    ],
    "c8b709f18b5a1745",
  ],
  Array [
    Object {
      "UnmatchedResponseBodyContentType": Object {
        "interactionTrail": Object {
          "path": Array [
            Object {
              "Method": Object {
                "method": "GET",
              },
            },
            Object {
              "ResponseBody": Object {
                "contentType": "application/xml",
                "statusCode": 200,
              },
            },
          ],
        },
        "requestsTrail": Object {
          "SpecPath": Object {
            "pathId": "path_P9esbhMNb0",
          },
        },
      },
    },
    Array [
      "4-0",
    ],
    "c92132f109d907d3",
  ],
  Array [
    Object {
      "UnmatchedResponseBodyContentType": Object {
        "interactionTrail": Object {
          "path": Array [
            Object {
              "Method": Object {
                "method": "GET",
              },
            },
            Object {
              "ResponseBody": Object {
                "contentType": "application/json",
                "statusCode": 200,
              },
            },
          ],
        },
        "requestsTrail": Object {
          "SpecPath": Object {
            "pathId": "path_8CU4hvBQlw",
          },
        },
      },
    },
    Array [
      "1-0",
    ],
    "db566846fc229498",
  ],
  Array [
    Object {
      "UnmatchedResponseBodyContentType": Object {
        "interactionTrail": Object {
          "path": Array [
            Object {
              "Method": Object {
                "method": "GET",
              },
            },
            Object {
              "ResponseBody": Object {
                "contentType": "application/json",
                "statusCode": 200,
              },
            },
          ],
        },
        "requestsTrail": Object {
          "SpecPath": Object {
            "pathId": "path_8CU4hvBQlw",
          },
        },
      },
    },
    Array [
      "2-0",
    ],
    "db566846fc229498",
  ],
  Array [
    Object {
      "UnmatchedResponseBodyContentType": Object {
        "interactionTrail": Object {
          "path": Array [
            Object {
              "Method": Object {
                "method": "GET",
              },
            },
            Object {
              "ResponseBody": Object {
                "contentType": "application/json",
                "statusCode": 200,
              },
            },
          ],
        },
        "requestsTrail": Object {
          "SpecPath": Object {
            "pathId": "path_8CU4hvBQlw",
          },
        },
      },
    },
    Array [
      "2-1",
    ],
    "db566846fc229498",
  ],
]
`
