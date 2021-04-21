/* IMPORTANT
 * This snapshot file is auto-generated, but designed for humans.
 * It should be checked into source control and tracked carefully.
 * Re-generate by setting TAP_SNAPSHOT=1 and running tests.
 * Make sure to inspect the output below.  Do not ignore changes!
 */
'use strict'
exports[`test/index.ts TAP spectacle batchCommits query > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "batchCommits": Array [],
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add endpoint to existing spec > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "method": "POST",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add new endpoint > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "method": "GET",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add optional response field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "GET",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add request and response > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "method": "POST",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add request field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "POST",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add request nested field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": null,
  },
  "errors": Array [
    Maximum call stack size exceeded

GraphQL request:2:7
1 | {
2 |       endpointChanges(sinceBatchCommitId: "cd16e405-d8c4-40f6-8462-f211a1688cd4") {
  |       ^
3 |         endpoints { {
      "locations": Array [
        Object {
          "column": 7,
          "line": 2,
        },
      ],
      "message": "Maximum call stack size exceeded",
      "path": Array [
        "endpointChanges",
      ],
    },
  ],
}
`

exports[`test/index.ts TAP spectacle changelog query add required response field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "GET",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query add response status code > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "GET",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query complex changes > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "method": "GET",
          "path": "/test2",
        },
        Null Object {
          "change": Null Object {
            "category": "added",
          },
          "method": "GET",
          "path": "/test1/{}",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query mark request field optional > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "POST",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query mark request nested field optional > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": null,
  },
  "errors": Array [
    Maximum call stack size exceeded

GraphQL request:2:7
1 | {
2 |       endpointChanges(sinceBatchCommitId: "9e6b2339-ede1-4eaf-9347-28a9854849bb") {
  |       ^
3 |         endpoints { {
      "locations": Array [
        Object {
          "column": 7,
          "line": 2,
        },
      ],
      "message": "Maximum call stack size exceeded",
      "path": Array [
        "endpointChanges",
      ],
    },
  ],
}
`

exports[`test/index.ts TAP spectacle changelog query no changes > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query update optional response field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "GET",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle changelog query update request field type > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "endpointChanges": Null Object {
      "endpoints": Array [
        Null Object {
          "change": Null Object {
            "category": "updated",
          },
          "method": "POST",
          "path": "/user",
        },
      ],
    },
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query add endpoint to existing spec > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_ITEgMzZBoj",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query add new endpoint > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query add optional response field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_I5A5eab4Wu",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query add request and response > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_X6m1bO8KVI",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query add request field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_qTPFUl6rR7",
              "name": "age",
              "shapeId": "shape_ZKhqeNIFuX",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_X6m1bO8KVI",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query add request nested field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_mUYKwMbnjm",
              "name": "address",
              "shapeId": "shape_D8Wv86lkdr",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_qTPFUl6rR7",
              "name": "age",
              "shapeId": "shape_KSUYvkm6ox",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_asZ4dzA9x3",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query add required response field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query add response status code > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_ITEgMzZBoj",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query complex changes > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_ITEgMzZBoj",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query mark request field optional > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_qTPFUl6rR7",
              "name": "age",
              "shapeId": "shape_KSUYvkm6ox",
            },
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_asZ4dzA9x3",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query mark request nested field optional > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_mUYKwMbnjm",
              "name": "address",
              "shapeId": "shape_D8Wv86lkdr",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_qTPFUl6rR7",
              "name": "age",
              "shapeId": "shape_KSUYvkm6ox",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_asZ4dzA9x3",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query no changes > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_ITEgMzZBoj",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query update optional response field > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_9E8tMaN7pT",
              "name": "age",
              "shapeId": "shape_ITEgMzZBoj",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_4aBRTBkk3X",
              "name": "name",
              "shapeId": "shape_XPEuTDdxkf",
            },
          ],
        },
        "id": "shape_jSAthS01Bb",
        "jsonType": "Object",
      },
    ],
  },
}
`

exports[`test/index.ts TAP spectacle shapeChoices query update request field type > must match snapshot 1`] = `
Object {
  "data": Null Object {
    "shapeChoices": Array [
      Null Object {
        "asArray": null,
        "asObject": Null Object {
          "fields": Array [
            Null Object {
              "changes": Null Object {
                "added": true,
                "changed": false,
              },
              "fieldId": "field_qTPFUl6rR7",
              "name": "age",
              "shapeId": "shape_KSUYvkm6ox",
            },
            Null Object {
              "changes": Null Object {
                "added": false,
                "changed": false,
              },
              "fieldId": "field_Uo8THxvA3Q",
              "name": "name",
              "shapeId": "shape_X6m1bO8KVI",
            },
          ],
        },
        "id": "shape_Uepabr07Dx",
        "jsonType": "Object",
      },
    ],
  },
}
`
